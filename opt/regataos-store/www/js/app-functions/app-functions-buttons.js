// Run shell process including scripts and commands
function runShellProcess(commandLine) {
	// Keep the process running independently from
	// the main process using 'spawn'.
	const { spawn } = require('child_process');
	const runCommandLine = spawn(commandLine, {
		shell: true,
		detached: true,
		stdio: 'ignore'
	});

	// Unlink the child process
	runCommandLine.unref();
}

// Install and remove apps
function appButtonsFunction() {
	const captureIframe = document.getElementById("iframe-regataos-store").contentWindow;
	const checkActionButtons = captureIframe.document.querySelectorAll(".versionapp");

	if (checkActionButtons) {
		const fs = require("fs");

		for (let i = 0; i < checkActionButtons.length; i++) {
			let appNickname = checkActionButtons[i].id.split("version-")[1];

			if (fs.existsSync(`/opt/regataos-store/apps-list/${appNickname}.json`)) {
				const data = fs.readFileSync(`/opt/regataos-store/apps-list/${appNickname}.json`, "utf8");
				const apps = JSON.parse(data);

				for (let i = 0; i < apps.length; i++) {
					// Open app
					captureIframe.document.getElementById(`open-${apps[i].nickname}`).onclick = function () {
						const commandOpen = apps[i].executable;
						runShellProcess(commandOpen);
					};

					// Install app
					captureIframe.document.getElementById(`install-${apps[i].nickname}`).onclick = function () {
						const commandInstall = `export name="${apps[i].name}"; \
					export nickname="${apps[i].nickname}"; \
					export package="${apps[i].package}"; \
					export package_prerm="${apps[i].package_prerm}"; \
					export package_preinst="${apps[i].package_preinst}"; \
					export extra_packages="${apps[i].extra_packages}"; \
					export architecture="${apps[i].architecture}"; \
					export repository_name="${apps[i].repository_name}"; \
					export repository_url="${apps[i].repository_url}"; \
					export download_link="${apps[i].download_link}"; \
					export restart_system="${apps[i].restart}"; \
					sudo -E ${selectTranslationScript()}/installapp/installapp-${apps[i].package_manager}; \
					sudo /opt/regataos-prime/scripts/apps-hybrid-graphics`;

						runShellProcess(commandInstall);
					};

					// Remove app
					captureIframe.document.getElementById(`remove-${apps[i].nickname}`).onclick = function () {
						const commandRemove = `export name="${apps[i].name}"; \
					export nickname="${apps[i].nickname}"; \
					export package="${apps[i].package}"; \
					export extra_packages="${apps[i].extra_packages}"; \
					export architecture="${apps[i].architecture}"; \
					export restart_system="${apps[i].restart}"; \
					sudo -E ${selectTranslationScript()}/removeapp/removeapp-${apps[i].package_manager}; \
					sudo /opt/regataos-prime/scripts/apps-hybrid-graphics`;

						runShellProcess(commandRemove);
					};
				}
			}

			if (fs.existsSync(`/opt/regataos-store/ebook-list/${appNickname}.json`)) {
				const data = fs.readFileSync(`/opt/regataos-store/ebook-list/${appNickname}.json`, "utf8");
				const ebook = JSON.parse(data);

				for (let i = 0; i < ebook.length; i++) {
					// Open external page
					captureIframe.document.getElementById(`open-page-${ebook[i].nickname}`).onclick = function () {
						const commandOpen = `xdg-open ${ebook[i].salepage}`;
						runShellProcess(commandOpen);
					};
				}
			}
		}
	}

	// Display featured ebooks on the store home page only if the store app is up to date.
	const showEbook = captureIframe.document.querySelectorAll(".show-ebook");
	if (showEbook) {
		for (let i = 0; i < showEbook.length; i++) {
			showEbook[i].style.display = "block";
		}
	}
}

setInterval(openLogFile, 1000);
function openLogFile() {
	const fs = require("fs");
	const exec = require('child_process').exec;

	if (fs.existsSync("/var/log/regataos-logs/open-log-file.log")) {
		let appNickname = fs.readFileSync("/var/log/regataos-logs/open-log-file.log", "utf8");
		appNickname = appNickname.replace(/(\r\n|\n|\r)/gm, "");
		appNickname = appNickname.replace(/ /g, '');

		let commandLine = `rm -f "/var/log/regataos-logs/open-log-file.log"; \
		kwrite "/var/log/regataos-logs/install-app-${appNickname}.log"`;
		exec(commandLine, (error, stdout, stderr) => {
		});
	}
}

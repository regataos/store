// Install and remove apps
function appButtonsFunction() {
	const fs = require("fs");
	const exec = require('child_process').exec;

	const captureIframe = document.getElementById("iframe-regataos-store").contentWindow;
	const captureIframeUrl = captureIframe.location.href;

	if ((captureIframeUrl.indexOf("app-") > -1) == "1") {
		// Get the app's nickname by checking the action buttons on the page.
		const getNicknameInstall = captureIframe.document.querySelector(".install-button").id;
		const getNicknameRemove = captureIframe.document.querySelector(".remove-button").id;
		let appNickname = ""

		if (getNicknameInstall !== null) {
			appNickname = getNicknameInstall.replace("install-", "");

		} else if (getNicknameRemove !== null) {
			appNickname = getNicknameRemove.replace("remove-", "");

		} else {
			appNickname = captureIframeUrl.split("app-")[1];
		}

		if (fs.existsSync(`/opt/regataos-store/apps-list/${appNickname}.json`)) {
			const data = fs.readFileSync(`/opt/regataos-store/apps-list/${appNickname}.json`, "utf8");
			const apps = JSON.parse(data);

			for (let i = 0; i < apps.length; i++) {
				// Open app
				captureIframe.document.getElementById(`open-${apps[i].nickname}`).onclick = function () {
					const commandOpen = apps[i].executable;
					exec(commandOpen, (error, stdout, stderr) => {
					});
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
					sudo -E ${selectTranslationScript()}/installapp/installapp-${apps[i].package_manager}; \
					sudo /opt/regataos-prime/scripts/apps-hybrid-graphics`;

					console.log(commandInstall);
					exec(commandInstall, (error, stdout, stderr) => {
						if (stdout) {
							fs.writeFile(`/var/log/regataos-logs/install-app-${apps[i].nickname}.log`, stdout, (err) => {
								if (err) throw err;
								console.log('The file has been saved!');
							});
						}
					});
				};

				// Remove app
				captureIframe.document.getElementById(`remove-${apps[i].nickname}`).onclick = function () {
					const commandRemove = `export name="${apps[i].name}"; \
					export nickname="${apps[i].nickname}"; \
					export package="${apps[i].package}"; \
					export extra_packages="${apps[i].extra_packages}"; \
					export architecture="${apps[i].architecture}"; \
					sudo -E ${selectTranslationScript()}/removeapp/removeapp-${apps[i].package_manager}; \
					sudo /opt/regataos-prime/scripts/apps-hybrid-graphics`;

					console.log(commandRemove);
					exec(commandRemove, (error, stdout, stderr) => {
						if (stdout) {
							fs.writeFile('/var/log/regataos-logs/remove-app.log', stdout, (err) => {
								if (err) throw err;
								console.log('The file has been saved!');
							});
						}
					});
				};
			}
		}
	}
}

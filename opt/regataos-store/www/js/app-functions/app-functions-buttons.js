// Install and remove apps
function appButtonsFunction() {
	const fs = require("fs");
	const exec = require('child_process').exec;

	const captureIframe = document.getElementById("iframe-regataos-store").contentWindow;
	const captureIframeUrl = captureIframe.location.href;

	if ((captureIframeUrl.indexOf("app-") > -1) == "1") {
		const appNickname = captureIframeUrl.split("app-")[1];

		if (fs.existsSync(`/opt/regataos-store/apps-list/${appNickname}.json`)) {
			const data = fs.readFileSync(`/opt/regataos-store/apps-list/${appNickname}.json`, "utf8");
			const apps = JSON.parse(data);

			for (let i = 0; i < apps.length; i++) {
				// Show install or remove button
				const installedApps = fs.readFileSync("/opt/regataos-store/installed-apps/installed-apps.txt", "utf8");

				function checkInstalledApps(installedInfo) {
					if ((installedInfo.indexOf(apps[i].nickname) > -1) == "1") {
						captureIframe.document.getElementById(`install-${apps[i].nickname}`).style.cssText = "display: none;";
						captureIframe.document.getElementById(`open-${apps[i].nickname}`).style.cssText = "display: block;";
						captureIframe.document.getElementById(`remove-${apps[i].nickname}`).style.cssText = "display: block;";
					} else {
						captureIframe.document.getElementById(`install-${apps[i].nickname}`).style.cssText = "display: block;";
						captureIframe.document.getElementById(`open-${apps[i].nickname}`).style.cssText = "display: none;";
						captureIframe.document.getElementById(`remove-${apps[i].nickname}`).style.cssText = "display: none;";
					}
				}
				checkInstalledApps(installedApps);

				let installedStatus = "";
				fs.watch("/opt/regataos-store/installed-apps/installed-apps.txt", function (event, filename) {
					if (event == "change") {
						installedStatus = fs.readFileSync("/opt/regataos-store/installed-apps/installed-apps.txt", "utf8");
						checkInstalledApps(installedStatus);
					}
				});

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
					sudo -E /opt/regataos-store/installapp/installapp-${apps[i].package_manager}; \
					sudo /opt/regataos-prime/scripts/apps-hybrid-graphics`;

					exec(commandInstall, (error, stdout, stderr) => {
						if (stdout) {
							fs.writeFile('/var/log/regataos-logs/install-app.log', stdout, (err) => {
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
					sudo -E /opt/regataos-store/removeapp/removeapp-${apps[i].package_manager}; \
					sudo /opt/regataos-prime/scripts/apps-hybrid-graphics`;

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

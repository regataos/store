// Checking if apps are being installed or removed
setInterval(appStatus, 500);
function appStatus() {
	const captureIframe = document.getElementById("iframe-regataos-store").contentWindow;
	const checkActionButtons = captureIframe.document.querySelectorAll(".versionapp");

	if (checkActionButtons) {
		const fs = require('fs');

		for (let i = 0; i < checkActionButtons.length; i++) {
			let appNickname = checkActionButtons[i].id.split("version-")[1];

			if (fs.existsSync(`/opt/regataos-store/apps-list/${appNickname}.json`)) {
				const appInstallButton = captureIframe.document.getElementById(`install-${appNickname}`);
				const appRemoveButton = captureIframe.document.getElementById(`remove-${appNickname}`);
				const appOpenButton = captureIframe.document.getElementById(`open-${appNickname}`);

				if (appInstallButton) {
					if (fs.existsSync(`/tmp/progressbar-store/installing-${appNickname}`)) {
						appInstallButton.classList.add("installing");
						appInstallButton.classList.remove("install-queue");
						appInstallButton.classList.remove("install-button");

					} else if (fs.existsSync("/tmp/progressbar-store/queued-process")) {
						const checkQueue = fs.readFileSync("/tmp/progressbar-store/queued-process", "utf8");
						const appForInstall = `${appNickname}=install`

						if (checkQueue.includes(appForInstall)) {
							appInstallButton.classList.add("install-queue");
							appInstallButton.classList.remove("installing");
							appInstallButton.classList.remove("install-button");

						} else {
							appInstallButton.classList.add("install-button");
							appInstallButton.classList.remove("installing");
							appInstallButton.classList.remove("install-queue");
						}

					} else {
						appInstallButton.classList.add("install-button");
						appInstallButton.classList.remove("installing");
						appInstallButton.classList.remove("install-queue");
					}
				}

				if (appRemoveButton) {
					if (fs.existsSync(`/tmp/progressbar-store/uninstalling-${appNickname}`)) {
						appRemoveButton.classList.add("removing");
						appRemoveButton.classList.remove("remove-queue");
						appRemoveButton.classList.remove("remove-button");
						appOpenButton.classList.add("open-button-off");

					} else if (fs.existsSync("/tmp/progressbar-store/queued-process")) {
						const checkQueue = fs.readFileSync("/tmp/progressbar-store/queued-process", "utf8");
						const appForRemove = `${appNickname}=remove`

						if (checkQueue.includes(appForRemove)) {
							appRemoveButton.classList.add("remove-queue");
							appRemoveButton.classList.remove("removing");
							appRemoveButton.classList.remove("remove-button");
							appOpenButton.classList.add("open-button-off");

						} else {
							appRemoveButton.classList.add("remove-button");
							appRemoveButton.classList.remove("remove-queue");
							appRemoveButton.classList.remove("removing");
							appOpenButton.classList.remove("open-button-off");
						}

					} else {
						appRemoveButton.classList.add("remove-button");
						appRemoveButton.classList.remove("remove-queue");
						appRemoveButton.classList.remove("removing");
						appOpenButton.classList.remove("open-button-off");
					}
				}

				// Show install or remove button
				const installedApps = fs.readFileSync("/opt/regataos-store/installed-apps/installed-apps.txt", "utf8");

				if (installedApps.includes(appNickname)) {
					appInstallButton.style.cssText = "display: none;";
					appRemoveButton.style.cssText = "display: block;";

					// Check if the "open" button should be functional
					const data = fs.readFileSync(`/opt/regataos-store/apps-list/${appNickname}.json`, "utf8");
					const apps = JSON.parse(data);

					for (let i = 0; i < apps.length; i++) {
						const displayOpenButton = apps[i].executable

						if (displayOpenButton.includes("none")) {
							appOpenButton.classList.add("open-button-off");
							appOpenButton.style.cssText = "display: block;";

						} else {
							appOpenButton.style.cssText = "display: block;";
						}
					}

				} else {
					if (appInstallButton) {
						appInstallButton.style.cssText = "display: block;";
						appOpenButton.style.cssText = "display: none;";
						appRemoveButton.style.cssText = "display: none;";
					}
				}
			}
		}
	}
}

setInterval(backButtonView, 500);
function backButtonView() {
	const GetiframeUrl = document.getElementById("iframe-regataos-store").contentWindow.location.href;

	if (GetiframeUrl.includes("app-")) {
		document.querySelector(".topbar").style.cssText = "display: flex;";

	} else if (GetiframeUrl.includes("search?q=")) {
		document.querySelector(".topbar").style.cssText = "display: flex;";

	} else {
		document.querySelector(".topbar").style.cssText = "display: none;";
	}
}

// Checking if apps are being installed or removed
setInterval(appStatus, 1000);

function appStatus() {
	const fs = require('fs');

	const captureIframe = document.getElementById("iframe-regataos-store").contentWindow;
	const pageUrl = captureIframe.location.href;

	if ((pageUrl.indexOf("app-") > -1) == "1") {
		const appNickname = pageUrl.split("app-")[1];

		if (fs.existsSync(`/opt/regataos-store/apps-list/${appNickname}.json`)) {
			const appInstallButton = captureIframe.document.getElementById(`install-${appNickname}`);
			const appRemoveButton = captureIframe.document.getElementById(`remove-${appNickname}`);
			const appOpenButton = captureIframe.document.getElementById(`open-${appNickname}`);

			if (fs.existsSync(`/tmp/progressbar-store/installing-${appNickname}`)) {
				appInstallButton.classList.add("installing");
				appInstallButton.classList.remove("install-queue");
				appInstallButton.classList.remove("install-button");

			} else if (fs.existsSync("/tmp/progressbar-store/queued-process")) {
				const checkQueue = fs.readFileSync("/tmp/progressbar-store/queued-process", "utf8");
				const appForInstall = `${appNickname}=install`

				if ((checkQueue.indexOf(appForInstall) > -1) == "1") {
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

			if (fs.existsSync(`/tmp/progressbar-store/uninstalling-${appNickname}`)) {
				appRemoveButton.classList.add("removing");
				appRemoveButton.classList.remove("remove-queue");
				appRemoveButton.classList.remove("remove-button");
				appOpenButton.classList.add("open-button-off");

			} else if (fs.existsSync("/tmp/progressbar-store/queued-process")) {
				const checkQueue = fs.readFileSync("/tmp/progressbar-store/queued-process", "utf8");
				const appForRemove = `${appNickname}=remove`

				if ((checkQueue.indexOf(appForRemove) > -1) == "1") {
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

			// Show install or remove button
			const installedApps = fs.readFileSync("/opt/regataos-store/installed-apps/installed-apps.txt", "utf8");

			if ((installedApps.indexOf(appNickname) > -1) == "1") {
				captureIframe.document.getElementById(`install-${appNickname}`).style.cssText = "display: none;";
				captureIframe.document.getElementById(`open-${appNickname}`).style.cssText = "display: block;";
				captureIframe.document.getElementById(`remove-${appNickname}`).style.cssText = "display: block;";
			} else {
				captureIframe.document.getElementById(`install-${appNickname}`).style.cssText = "display: block;";
				captureIframe.document.getElementById(`open-${appNickname}`).style.cssText = "display: none;";
				captureIframe.document.getElementById(`remove-${appNickname}`).style.cssText = "display: none;";
			}
		}
	}
}

setInterval(backButtonView, 1000);
function backButtonView() {
	const GetiframeUrl = document.getElementById("iframe-regataos-store").contentWindow.location.href;

	if ((GetiframeUrl.indexOf("app-") > -1) == "1") {
		document.querySelector(".topbar").style.cssText = "display: flex;";

	} else if ((GetiframeUrl.indexOf("search?q=") > -1) == "1") {
		document.querySelector(".topbar").style.cssText = "display: flex;";

	} else {
		document.querySelector(".topbar").style.cssText = "display: none;";
	}
}

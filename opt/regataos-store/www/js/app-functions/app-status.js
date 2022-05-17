// Checking if apps are being installed or removed
setInterval(appStatus, 1000);

function appStatus() {
	const fs = require('fs');

	const captureIframe = document.getElementById("iframe-regataos-store").contentWindow;
	const pageUrl = captureIframe.location.href;
	const appName = pageUrl.split("app-")[1];

	if ((pageUrl.indexOf("app-") > -1) == "1") {
		const appInstallButton = captureIframe.document.getElementById(`install-${appName}`);
		const appRemoveButton = captureIframe.document.getElementById(`remove-${appName}`);
		const appOpenButton = captureIframe.document.getElementById(`open-${appName}`);

		if (fs.existsSync(`/tmp/progressbar-store/installing-${appName}`)) {
			appInstallButton.classList.add("installing");
			appInstallButton.classList.remove("install-queue");
			appInstallButton.classList.remove("install-button");

		} else if (fs.existsSync("/tmp/progressbar-store/queued-process")) {
			const checkQueue = fs.readFileSync("/tmp/progressbar-store/queued-process", "utf8");
			const appForInstall = `${appName}=install`

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

		if (fs.existsSync(`/tmp/progressbar-store/uninstalling-${appName}`)) {
			appRemoveButton.classList.add("removing");
			appRemoveButton.classList.remove("remove-queue");
			appRemoveButton.classList.remove("remove-button");
			appOpenButton.classList.add("open-button-off");

		} else if (fs.existsSync("/tmp/progressbar-store/queued-process")) {
			const checkQueue = fs.readFileSync("/tmp/progressbar-store/queued-process", "utf8");
			const appForRemove = `${appName}=remove`

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
	}
}

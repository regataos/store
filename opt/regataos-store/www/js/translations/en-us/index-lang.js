// English language translation

//Translation for app pages
setInterval(translateAppPage, 300);

function translateAppPage() {
	const captureIframe = document.getElementById("iframe-regataos-store").contentWindow;
	const pageUrl = captureIframe.location.href;

	if ((pageUrl.indexOf("app-") > -1) == "1") {
		const installButton = captureIframe.document.querySelector(".install-button");
		const installButtonExists = captureIframe.document.body.contains(installButton)
		if (installButtonExists) {
			installButton.innerHTML = "Install";
		}

		const gameButton = captureIframe.document.querySelector(".game-button");
		const gameButtonExists = captureIframe.document.body.contains(gameButton)
		if (gameButtonExists) {
			gameButton.innerHTML = "Install";
		}

		const InstallingButton = captureIframe.document.querySelector(".installing");
		const InstallingButtonExists = captureIframe.document.body.contains(InstallingButton)
		if (InstallingButtonExists) {
			InstallingButton.innerHTML = "Installing...";
		}

		const removeButton = captureIframe.document.querySelector(".remove-button");
		const removeButtonExists = captureIframe.document.body.contains(removeButton)
		if (removeButtonExists) {
			removeButton.innerHTML = "Uninstall";
		}

		const removingButton = captureIframe.document.querySelector(".removing");
		const removingButtonExists = captureIframe.document.body.contains(removingButton)
		if (removingButtonExists) {
			removingButton.innerHTML = "Uninstalling...";
		}

		const queueButton = captureIframe.document.querySelector(".remove-queue, .install-queue");
		const queueButtonExists = captureIframe.document.body.contains(queueButton)
		if (queueButtonExists) {
			queueButton.innerHTML = "Pending...";
		}

		const openButton = captureIframe.document.querySelector(".open-button");
		const openButtonExists = captureIframe.document.body.contains(openButton)
		if (openButtonExists) {
			openButton.innerHTML = "Open";
		}
	}
}

// Translation for the desktop app
//Check internet connection
document.querySelector(".networkoff .networkoff-title").innerHTML = "Unable to connect to the Internet";
document.querySelector(".networkoff .networkoff-desc").innerHTML = "Check the network, modem and router cables or<br/> connect to the Wi-Fi network again.";

//Top search
document.querySelector("#field").value = "Search";
document.querySelector("#field").setAttribute("onfocus", "if (this.value == 'Search') {this.value = '';}");
document.querySelector("#field").setAttribute("onblur", "if (this.value == '') {this.value = 'Search';}");

//Top back button
document.querySelector(".topbar").title = "Back to the previous page";

// Side bar
//Home
document.querySelector(".home p").innerHTML = "Discover";

//Create
document.querySelector(".create p").innerHTML = "Create";

//Work
document.querySelector(".work p").innerHTML = "Work";

//Game
document.querySelector(".game p").innerHTML = "Play";

//Develop
document.querySelector(".develop p").innerHTML = "Develop";

//Utilities
document.querySelector(".utilities p").innerHTML = "Utilities";

//Installed
document.querySelector(".installed p").innerHTML = "Installed";

//Installing
document.querySelector(".li-sidebar-b i").title = "Installation in progress...";

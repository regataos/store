// Show app only when the UI is ready
const gui = require('nw.gui');
onload = function () {
	gui.Window.get().show();
}

// Disable main hover effect after few seconds
setTimeout(function () {
	document.getElementById("loadscreen").style.display = "none";
}, 2500);

const fs = require("fs");

// Check internet connection for topbar
function checkOnline() {
	fetch('https://www.google.com/', {
		method: 'GET',
		mode: 'no-cors',
	}).then((result) => {
		document.querySelector(".networkoff").style.cssText = "display: none;";
		document.querySelector(".sidebar").style.cssText = "display: block;";
		document.querySelector(".page").style.cssText = "display: block;";
		document.querySelector("body").style.cssText = "background: #ccc;";
	}).catch(e => {
		document.querySelector("body").style.cssText = "background: #36393f;";
		document.querySelector(".sidebar").style.cssText = "display: none;";
		document.querySelector(".page").style.cssText = "display: none;";
		document.querySelector(".networkoff").style.cssText = "display: block;";
	})
}
checkOnline();

// Show progress bar if process starts
function showProgressBar() {
	function appStoreWorkStatus(status) {
		const showMoreInfoButton = document.querySelector(".more-info");
		const hideMoreInfoButton = document.querySelector(".more-info2");
		const progressBar = document.querySelector(".progress-bar");
		const installInconProgress = document.querySelector(".li-sidebar-b");
		const showProgressBarFull = document.querySelector(".progress-bar-full");
		const uninstallInconProgress = document.querySelector(".li-sidebar-uninstalling");

		if ((storeStatus.includes("installing")) ||
			(storeStatus.includes("uninstalling")) ||
			(storeStatus.includes("stopped"))) {
			// Show the progress of installing/uninstalling apps.
			if (window.innerWidth >= 1176) {
				progressBar.classList.add("progress-bar-show");
			} else {
				progressBar.classList.remove("progress-bar-show");
			}

			window.addEventListener('resize', function () {
				let win = this;
				let checkStatus = fs.readFileSync("/tmp/regataos-store/config/status.txt", "utf8");

				if (win.innerWidth >= 1176) {
					if (!checkStatus.includes("inactive")) {
						progressBar.classList.add("progress-bar-show");
					}
				} else {
					progressBar.classList.remove("progress-bar-show");
				}
			});

			if (status.includes("uninstalling")) {
				installInconProgress.style.cssText = "display: none;";
				uninstallInconProgress.style.cssText = "display: block;";
			} else {
				installInconProgress.style.cssText = "display: block;";
				uninstallInconProgress.style.cssText = "display: none;";
			}

			if (fs.existsSync("/tmp/progressbar-store/queued-3")) {
				showProgressBarFull.style.cssText = "width: 435px;";
			} else {
				showProgressBarFull.style.cssText = "width: 423px;";
			}

		} else {
			progressBar.classList.remove("progress-bar-show");
			showProgressBarFull.classList.remove("progress-bar-full-show");
			installInconProgress.style.cssText = "display: none;";
			uninstallInconProgress.style.cssText = "display: none;";
			showMoreInfoButton.style.cssText = "display: block";
			hideMoreInfoButton.style.cssText = "display: none";
		}
	}

	let storeStatus = "";
	if (fs.existsSync("/tmp/progressbar-store/installing")) {
		setTimeout(function () {
			storeStatus = "installing";
			appStoreWorkStatus("installing");
		}, 3000);
	}

	fs.watch("/tmp/regataos-store/config/status.txt", function (event, filename) {
		if (event == "change") {
			setInterval(function () {
				storeStatus = fs.readFileSync("/tmp/regataos-store/config/status.txt", "utf8");
				appStoreWorkStatus(storeStatus);
			}, 1000);
		}
	});
}
showProgressBar()

//Show progress bar if process starts
function startFullProgressBar() {
	const showProgressBarFull = document.querySelector(".progress-bar-full");
	const showMoreInfoButton = document.querySelector(".more-info");
	const hideMoreInfoButton = document.querySelector(".more-info2");
	const sideBarButton = document.querySelector(".li-sidebar-b .sidebar-item-effect");
	const sideBarUninstalling = document.querySelector(".li-sidebar-uninstalling .sidebar-item-effect");

	function showFullProgressBar() {
		showProgressBarFull.classList.add("progress-bar-full-show");
		showProgressBarFull.classList.remove("progress-bar-full-hide");
		sideBarUninstalling.classList.add("sidebar-item-effect-on");
		sideBarButton.classList.add("sidebar-item-effect-on");

		setTimeout(function () {
			showMoreInfoButton.style.cssText = "display: none;";
			hideMoreInfoButton.style.cssText = "display: block;";
		}, 100);
	}

	function hideFullProgressBar() {
		showProgressBarFull.classList.add("progress-bar-full-hide");
		showProgressBarFull.classList.remove("progress-bar-full-show");
		sideBarUninstalling.classList.remove("sidebar-item-effect-on");
		sideBarButton.classList.remove("sidebar-item-effect-on");

		setTimeout(function () {
			showMoreInfoButton.style.cssText = "display: block;";
			hideMoreInfoButton.style.cssText = "display: none;";
			showProgressBarFull.style.cssText = "display: none;";
		}, 100);
	}

	if (showProgressBarFull.classList.contains("progress-bar-full-hide")) {
		showFullProgressBar();
	} else if (showProgressBarFull.classList.contains("progress-bar-full-show")) {
		hideFullProgressBar();
	} else {
		showFullProgressBar();
	}
}

// Check the system language information to set the store's primary url
function setMainUrl() {
	const urlStore = {
		"pt-br": "https://newstore-regataos.blogspot.com",
		"pt-pt": "https://newstore-regataos.blogspot.com",
		"pt": "https://newstore-regataos.blogspot.com",
		"en-us": "https://en-newstore-regataos.blogspot.com",
		"en-gb": "https://en-newstore-regataos.blogspot.com"
	};

	if (typeof urlStore[getSystemLanguage()] !== "undefined") {
		return urlStore[getSystemLanguage()];
	} else {
		return urlStore["en-us"];
	}
}

// Open the iframe with the app store homepage
function homeStore() {
	const iframeRegataStore = document.getElementById("iframe-regataos-store").contentWindow;

	if (fs.existsSync("/usr/share/regataos/enterprise-iso.txt")) {
		iframeRegataStore.document.location.href = `${setMainUrl()}/p/enterprise.html`;
		document.querySelector("li.game").style.cssText = "display: none;";
	} else {
		iframeRegataStore.document.location.href = `${setMainUrl()}/p/home.html`;
		document.querySelector("li.game").style.cssText = "display: block;";
	}
}

// Show or hide specific elements, depending on the URL visited
function showHideElements() {
	const iframeStoreUrl = document.getElementById("iframe-regataos-store").contentWindow.location.href;

	const removeString = new RegExp(setMainUrl(), "g");
	const pageId = iframeStoreUrl.replace(removeString).replace(/undefined/g, "").replace(/\//g, "");

	const specialPage = {
		"home": "home",
		"enterprise": "home",
		"apps-installed2": "installed",
	};

	if ((iframeStoreUrl.includes("app-")) ||
		(iframeStoreUrl.includes("search?q="))) {
		const linksPage = document.querySelectorAll(".li-sidebar .sidebar-item-effect");
		for (let i = 0; i < linksPage.length; i++) {
			linksPage[i].classList.remove("sidebar-item-effect-on");
		}
	}

	if (iframeStoreUrl.includes(specialPage[pageId])) {
		const linksPage = document.querySelectorAll(".li-sidebar .sidebar-item-effect");
		for (let i = 0; i < linksPage.length; i++) {
			linksPage[i].classList.remove("sidebar-item-effect-on");
		}
		document.querySelector(`.${specialPage[pageId]} .sidebar-item-effect`).classList.add("sidebar-item-effect-on");
	} else {
		document.querySelector(".special-page .sidebar-item-effect").classList.remove("sidebar-item-effect-on");
	}

	// Special handling is required when the installed apps page is accessed
	if (iframeStoreUrl.includes("apps-installed2")) {
		sessionStorage.setItem("goInstalledPage", "access");
	} else if (!iframeStoreUrl.includes("app-")) {
		sessionStorage.setItem("goInstalledPage", "noaccess");
	}
}

function goInnerPage(pageId) {
	const getIframeStore = document.getElementById("iframe-regataos-store").contentWindow;
	getIframeStore.document.location.href = `${setMainUrl()}/p/${pageId}.html`;
	const linksPage = document.querySelectorAll(".li-sidebar .sidebar-item-effect");

	setTimeout(function () {
		const iframeStoreUrl = getIframeStore.location.href;
		for (let i = 0; i < linksPage.length; i++) {
			if (iframeStoreUrl.includes(pageId)) {
				linksPage[i].classList.remove("sidebar-item-effect-on");
				console.log(pageId);
				document.querySelector(`.${pageId} .sidebar-item-effect`).classList.add("sidebar-item-effect-on");
			} else {
				linksPage[i].classList.remove("sidebar-item-effect-on");
			}
		}
	}, 1000);
}

//Go for Home page
function goToHome() {
	const urlForIframe = document.getElementById("iframe-regataos-store").contentWindow

	if (fs.existsSync("/usr/share/regataos/enterprise-iso.txt")) {
		urlForIframe.document.location.href = `${setMainUrl()}/p/enterprise.html`;
	} else {
		urlForIframe.document.location.href = `${setMainUrl()}/p/home.html`;
	}
}

// Function back button
function backButton() {
	let installedPageStatus = sessionStorage.getItem("goInstalledPage");
	if (!installedPageStatus.includes("noaccess")) {
		history.go(-2);
	} else {
		history.go(-1);
	}

	setTimeout(function () {
		const iframeStoreUrl = document.getElementById("iframe-regataos-store").contentWindow.location.href;
		const linksPage = document.querySelectorAll(".li-sidebar .sidebar-item-effect");

		const removeString = new RegExp(setMainUrl(), "g");
		const pageId = iframeStoreUrl.replace(removeString).replace(/undefined/g, "").replace(/\//g, "");

		for (let i = 0; i < linksPage.length; i++) {
			if (iframeStoreUrl.includes(pageId)) {
				linksPage[i].classList.remove("sidebar-item-effect-on");
				document.querySelector(`.${pageId} .sidebar-item-effect`).classList.add("sidebar-item-effect-on");
			} else {
				linksPage[i].classList.remove("sidebar-item-effect-on");
			}
		}
	}, 1000);
}

// Search box
function searchBox() {
	const input = document.getElementById("field");
	input.addEventListener("keypress", function(event) {
	if (event.key === "Enter") {
		const iframe = document.getElementById("iframe-regataos-store");
		const data = input.value
		document.getElementById("field").value = "";
		iframe.contentWindow.document.location.href = `${setMainUrl()}/search?q=${data}`;
		sessionStorage.setItem("goInstalledPage", "noaccess");
		window.scrollTo(0, 0);
		event.preventDefault();
	}
	});
}

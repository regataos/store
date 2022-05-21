const fs = require("fs");

setInterval(function () {
	const getIframeStore = document.getElementById("iframe-regataos-store").contentWindow;
	window.location.href
}, 500);

// Check internet connection for topbar
function checkImage(url) {
	let request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.send();
	request.onload = function () {
		let status = request.status;
		if (request.status == 200) {
			document.querySelector(".networkoff").style.cssText = "display: none;";
			document.querySelector(".sidebar").style.cssText = "display: block;";
			document.querySelector(".page").style.cssText = "display: block;";
			document.querySelector("body").style.cssText = "background: #ccc;";
		} else {
			document.querySelector("body").style.cssText = "background: #36393f;";
			document.querySelector(".sidebar").style.cssText = "display: none;";
			document.querySelector(".page").style.cssText = "display: none;";
			document.querySelector(".networkoff").style.cssText = "display: block;";
		}
	}
}
checkImage("https://www.google.com/logos/google.jpg");

// Show progress bar if process starts
function showProgressBar() {
	function appStoreWorkStatus(status) {
		const showMoreInfoButton = document.querySelector(".more-info");
		const hideMoreInfoButton = document.querySelector(".more-info2");
		const progressBar = document.querySelector(".progress-bar");
		const installInconProgress = document.querySelector(".li-sidebar-b");
		const showProgressBarFull = document.querySelector(".progress-bar-full");
		const uninstallInconProgress = document.querySelector(".li-sidebar-uninstalling");

		if (((storeStatus.indexOf("installing") > -1) == "1") ||
			((storeStatus.indexOf("uninstalling") > -1) == "1")) {
			// Show the progress of installing/uninstalling apps.
			progressBar.classList.add("progress-bar-show");

			if ((status.indexOf("uninstalling") > -1) == "1") {
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
	const sideBarButton = document.querySelector(".li-sidebar-b a");
	const sideBarUninstalling = document.querySelector(".li-sidebar-uninstalling a");

	function showFullProgressBar() {
		showProgressBarFull.classList.add("progress-bar-full-show");
		showProgressBarFull.classList.remove("progress-bar-full-hide");
		sideBarUninstalling.style.cssText = "border-left: 4px solid #0085e4";
		sideBarButton.style.cssText = "border-left: 4px solid #0085e4";

		setTimeout(function () {
			showMoreInfoButton.style.cssText = "display: none;";
			hideMoreInfoButton.style.cssText = "display: block;";
		}, 100);
	}

	function hideFullProgressBar() {
		showProgressBarFull.classList.add("progress-bar-full-hide");
		showProgressBarFull.classList.remove("progress-bar-full-show");
		sideBarUninstalling.style.cssText = "border-left: 4px solid #2f3136";
		sideBarButton.style.cssText = "border-left: 4px solid #2f3136";

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

// Check configuration files
function checkConfigFile(data, desiredString) {
	const searchString = new RegExp(`(?<=${desiredString}).*`, "g");

	let systemConfig = data.match(searchString)[0];
	systemConfig = systemConfig.replace(/:.*/g, '');
	systemConfig = systemConfig.replace(/\.UTF-8/g, "");
	return systemConfig;
}

// Check the system language information to set the store's primary url
function setMainUrl() {
	const urlStore = {
		"pt_BR": "https://newstore-regataos.blogspot.com",
		"pt_PT": "https://newstore-regataos.blogspot.com",
		"en_US": "https://en-newstore-regataos.blogspot.com",
	};

	if (fs.existsSync("/tmp/regataos-configs/config/plasma-localerc")) {
		const checkLangSystem = fs.readFileSync("/tmp/regataos-configs/config/plasma-localerc", "utf8");

		if (checkLangSystem.includes("LANGUAGE")) {
			const configOption = "LANGUAGE="
			const languageDetected = checkConfigFile(checkLangSystem, configOption);

			if (typeof urlStore[languageDetected] !== "undefined") {
				return urlStore[languageDetected];
			} else {
				return urlStore["en_US"];
			}

		} else if (checkLangSystem.includes("LANG")) {
			const configOption = "LANG="
			const languageDetected = checkConfigFile(checkLangSystem, configOption);

			if (typeof urlStore[languageDetected] !== "undefined") {
				return urlStore[languageDetected];
			} else {
				return urlStore["en_US"];
			}
		}

	} else if (fs.existsSync("/tmp/regataos-configs/config/user-dirs.locale")) {
		const checkLangSystem = fs.readFileSync("/tmp/regataos-configs/config/user-dirs.locale", "utf8");

		if (typeof urlStore[checkLangSystem] !== "undefined") {
			return urlStore[checkLangSystem];
		} else {
			return urlStore["en_US"];
		}
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

	if (((iframeStoreUrl.indexOf("app-") > -1) == "1") ||
		((iframeStoreUrl.indexOf("search?q=") > -1) == "1")) {

		const linksPage = document.querySelectorAll(".li-sidebar a");
		for (let i = 0; i < linksPage.length; i++) {
			linksPage[i].classList.remove("link-items-on");
		}
	}

	if ((iframeStoreUrl.indexOf(specialPage[pageId]) > -1) == "1") {
		const linksPage = document.querySelectorAll(".li-sidebar a");
		for (let i = 0; i < linksPage.length; i++) {
			linksPage[i].classList.remove("link-items-on");
		}

		document.querySelector(`.${specialPage[pageId]} a`).classList.add("link-items-on");

	} else {
		document.querySelector(".special-page a").classList.remove("link-items-on");
	}

	// Special handling is required when the installed apps page is accessed
	if ((iframeStoreUrl.indexOf("apps-installed2") > -1) == "1") {
		sessionStorage.setItem("goInstalledPage", "access");
	} else if ((iframeStoreUrl.indexOf("app-") > -1) == "0") {
		sessionStorage.setItem("goInstalledPage", "noaccess");
	}
}

function goInnerPage(pageId) {
	const getIframeStore = document.getElementById("iframe-regataos-store").contentWindow;
	const linksPage = document.querySelectorAll(".li-sidebar a");

	getIframeStore.document.location.href = `${setMainUrl()}/p/${pageId}.html`;

	setTimeout(function () {
		const iframeStoreUrl = getIframeStore.location.href;

		for (let i = 0; i < linksPage.length; i++) {
			if ((iframeStoreUrl.indexOf(pageId) > -1) == "1") {
				linksPage[i].classList.remove("link-items-on");
				document.querySelector(`.${pageId} a`).classList.add("link-items-on");

			} else {
				linksPage[i].classList.remove("link-items-on");
			}
		}
	}, 500);
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
	if ((installedPageStatus.indexOf("noaccess") > -1) == "0") {
		history.go(-2);
	} else {
		history.go(-1);
	}

	setTimeout(function () {
		const iframeStoreUrl = document.getElementById("iframe-regataos-store").contentWindow.location.href;
		const linksPage = document.querySelectorAll(".li-sidebar a");

		const removeString = new RegExp(setMainUrl(), "g");
		const pageId = iframeStoreUrl.replace(removeString).replace(/undefined/g, "").replace(/\//g, "");

		for (let i = 0; i < linksPage.length; i++) {
			if ((iframeStoreUrl.indexOf(pageId) > -1) == "1") {
				linksPage[i].classList.remove("link-items-on");
				document.querySelector(`.${pageId} a`).classList.add("link-items-on");
			} else {
				linksPage[i].classList.remove("link-items-on");
			}
		}
	}, 500);
}

// Search box
function searchBox() {
	const form = document.getElementById("form");
	const field = document.getElementById("field");

	form.addEventListener('submit', function (e) {
		const data = field.value
		document.getElementById("field").value = "";

		document.getElementById("iframe-regataos-store").contentWindow.document.location.href = `${setMainUrl()}/search?q=${data}`;
		sessionStorage.setItem("goInstalledPage", "noaccess");

		window.scrollTo(0, 0);
		e.preventDefault();
	});
}

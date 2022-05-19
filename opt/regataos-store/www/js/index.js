const fs = require("fs");
const exec = require("child_process").exec;

// Show progress bar if process starts
function showProgressBar() {
	const showMoreInfoButton = document.querySelector(".more-info");
	const hideMoreInfoButton = document.querySelector(".more-info2");
	const progressBar = document.querySelector(".progress-bar");
	const installInconProgress = document.querySelector(".li-sidebar-b");
	const showProgressBarFull = document.querySelector(".progress-bar-full");
	const uninstallInconProgress = document.querySelector(".li-sidebar-uninstalling");

	if (fs.existsSync("/tmp/progressbar-store/progressbar")) {
		progressBar.classList.add("progress-bar-show");

		if (fs.existsSync("/tmp/progressbar-store/uninstalling")) {
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

		if (fs.existsSync("/tmp/progressbar-store/speed")) {
			progressBar.style.cssText = "height: 205px;";
		} else {
			progressBar.style.cssText = "height: 180px;";
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
			showMoreInfoButton.style.cssText = "display: none";
			hideMoreInfoButton.style.cssText = "display: block";
		}, 100);
	}

	function hideFullProgressBar() {
		showProgressBarFull.classList.add("progress-bar-full-hide");
		showProgressBarFull.classList.remove("progress-bar-full-show");
		sideBarUninstalling.style.cssText = "border-left: 4px solid #2f3136";
		sideBarButton.style.cssText = "border-left: 4px solid #2f3136";

		setTimeout(function () {
			showMoreInfoButton.style.cssText = "display: block";
			hideMoreInfoButton.style.cssText = "display: none";
			showProgressBarFull.style.cssText = "display: none";
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
	let systemLanguage = data.match(searchString)[0];
	systemLanguage = systemLanguage.replace(/:.*/g, '');
	systemLanguage = systemLanguage.replace(/\.UTF-8/g, "");
	return systemLanguage;
}

// Check the system language information to set the store's primary url
function setMainUrl() {
	const urlStore = {
		"pt_BR": "https://newstore-regataos.blogspot.com/",
		"pt_PT": "https://newstore-regataos.blogspot.com/",
		"en_US": "https://en-newstore-regataos.blogspot.com/",
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
		}

		if (checkLangSystem.includes("LANG")) {
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

// Show or hide specific elements, depending on the URL visited
function showHideElements() {
	const iframeStoreUrl = document.getElementById("iframe-regataos-store").contentWindow.location.href;

	if (((iframeStoreUrl.indexOf("app-") > -1) == "1") ||
		((iframeStoreUrl.indexOf("search?q=") > -1) == "1")) {
		document.querySelector(".topbar").style.cssText = "display: flex;";

	} else {
		document.querySelector(".topbar").style.cssText = "display: none;";
	}

	if ((iframeStoreUrl.indexOf("apps-installed2") > -1) == "1") {
		document.querySelector(".installed a").classList.add("link-items-on");

	} else {
		document.querySelector(".installed a").classList.remove("link-items-on");
	}

	if (((iframeStoreUrl.indexOf("home") > -1) == "1") ||
		((iframeStoreUrl.indexOf("enterprise") > -1) == "1")) {
		document.querySelector(".home a").classList.add("link-items-on");

	} else {
		document.querySelector(".home a").classList.remove("link-items-on");
	}

	if ((iframeStoreUrl.indexOf("create") > -1) == "1") {
		document.querySelector(".create a").classList.add("link-items-on");

	} else {
		document.querySelector(".create a").classList.remove("link-items-on");
	}

	if ((iframeStoreUrl.indexOf("work") > -1) == "1") {
		document.querySelector(".work a").classList.add("link-items-on");

	} else {
		document.querySelector(".work a").classList.remove("link-items-on");
	}

	if ((iframeStoreUrl.indexOf("game") > -1) == "1") {
		document.querySelector(".game a").classList.add("link-items-on");

	} else {
		document.querySelector(".game a").classList.remove("link-items-on");
	}

	if ((iframeStoreUrl.indexOf("develop") > -1) == "1") {
		document.querySelector(".develop a").classList.add("link-items-on");

	} else {
		document.querySelector(".develop a").classList.remove("link-items-on");
	}

	if ((iframeStoreUrl.indexOf("utilities") > -1) == "1") {
		document.querySelector(".utilities a").classList.add("link-items-on");

	} else {
		document.querySelector(".utilities a").classList.remove("link-items-on");
	}
}

function goInnerPage(pageId) {
	const urlForIframe = document.getElementById("iframe-regataos-store").contentWindow
	urlForIframe.document.location.href = `${setMainUrl()}p/${pageId}.html`;

	fs.unlinkSync("/tmp/regataos-store/go-installed");
}

// Open the iframe with the app store homepage
function homeStore() {
	const iframeRegataStore = document.getElementById("iframe-regataos-store").contentWindow;

	if (fs.existsSync("/usr/share/regataos/enterprise-iso.txt")) {
		iframeRegataStore.document.location.href = `${setMainUrl()}p/enterprise.html`;
	} else {
		iframeRegataStore.document.location.href = `${setMainUrl()}p/home.html`;
	}
}

//Go for Home page
function goToHome() {
	const urlForIframe = document.getElementById("iframe-regataos-store").contentWindow

	if (fs.existsSync("/usr/share/regataos/enterprise-iso.txt")) {
		urlForIframe.document.location.href = `${setMainUrl()}p/enterprise.html`;
	} else {
		urlForIframe.document.location.href = `${setMainUrl()}p/home.html`;
	}
}

// Function back button
function voltar() {
	setTimeout(function () {
		const backButton = document.querySelector(".topbar");
		backButton.style.cssText = "display: none;";
	}, 500);

	fs.access('/tmp/regataos-store/go-installed', (err) => {
		if (!err) {
			history.go(-2);
			return;
		} else {
			history.go(-1);
		}
	});
}

// Show or hide specific elements, depending on the URL visited, and perform other tasks
// Check internet connection for topbar
function check_network_topbar() {
	fs.readFile('/tmp/apps-scripts/network-status.txt', (err, data) => {
		if (err) throw err;
		var data = data
		if ((data.indexOf("online") > -1) == "1") {
			var captureIframe = document.getElementById("iframe-regataos-store").contentWindow.location.href
			if ((captureIframe.indexOf("home") > -1) == "1") {
				$(document).ready(function () {
					$(".topbar").css("display", "none")
				});
			}
		} else if ((data.indexOf("offline") > -1) == "1") {
			$(document).ready(function () {
				$(".topbar").css("display", "none")
			});
		}

	});
}
check_network_topbar()

// For Enterprise
function for_enterprise() {
	fs.access('/usr/share/regataos/enterprise-iso.txt', (err) => {
		if (!err) {
			$("li.game").css("display", "none")
		} else {
			$("li.game").css("display", "block")
		}
	});
}

// Prepare to return to the "Installed" page.
function go_install() {
	var capture_iframe_url = document.getElementById("iframe-regataos-store").contentWindow.location.href

	if ((capture_iframe_url.indexOf("apps-installed2") > -1) == "1") {
		if (!fs.existsSync("/tmp/regataos-store/go-installed")) {
			fs.writeFileSync("/tmp/regataos-store/go-installed", "go installed");
		}

	} else if ((capture_iframe_url.indexOf("app-") > -1) == "0") {
		if (fs.existsSync("/tmp/regataos-store/go-installed")) {
			fs.unlinkSync("/tmp/regataos-store/go-installed");
		}
	}
}

setInterval(function () {
	go_install();
}, 500);

setInterval(function () {
	for_enterprise();
	showProgressBar();
}, 500);

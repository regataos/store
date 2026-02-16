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

(function () {
  "use strict";

  let _loadTimer = null;
  let _lastHref = "";

  window.onStoreIframeLoad = function () {
    clearTimeout(_loadTimer);
    _loadTimer = setTimeout(() => {
      const iframe = document.getElementById("iframe-regataos-store");
      if (!iframe || !iframe.contentWindow) return;

      const href = String(iframe.contentWindow.location && iframe.contentWindow.location.href || "");
      // Evita rodar de novo se for o mesmo href
      if (href === _lastHref) return;
      _lastHref = href;

      try { showHideElements(); } catch (e) { console.error(e); }
      try { appButtonsFunction(); } catch (e) { console.error(e); }

      // Só roda o que precisa, conforme a página
      if (href.includes("apps-installed2")) {
        try { installedPage(); } catch (e) { console.error(e); }
      }

      // Versão só faz sentido em páginas que exibem .versionapp
      if (href.includes("app-") || href.includes("apps") || href.includes("search?q=")) {
        try { appVersion(); } catch (e) { console.error(e); }
      }
    }, 50);
  };
})();

// Show progress bar if process starts
function showProgressBar() {

	// --- Performance fixes (avoid interval leaks & repeated listeners) ---
	const STATUS_PATH = "/tmp/regataos-store/config/status.txt";
	let storeStatus = "inactive";
	let statusDebounceTimer = null;
	let resizeListenerRegistered = false;
	let resizeTicking = false;

	function updateProgressBarVisibility(progressBarEl) {
		if (!progressBarEl) return;
		// Only show progress bar on wide layouts and when store is not inactive
		if (window.innerWidth >= 1176 && !storeStatus.includes("inactive")) {
			progressBarEl.classList.add("progress-bar-show");
		} else {
			progressBarEl.classList.remove("progress-bar-show");
		}
	}

	function appStoreWorkStatus(status) {
		const showMoreInfoButton = document.querySelector(".more-info");
		const hideMoreInfoButton = document.querySelector(".more-info2");
		const progressBar = document.querySelector(".progress-bar");
		const installInconProgress = document.querySelector(".li-sidebar-b");
		const showProgressBarFull = document.querySelector(".progress-bar-full");
		const uninstallInconProgress = document.querySelector(".li-sidebar-uninstalling");

		// Cache latest status for resize logic
		storeStatus = String(status || "");

		// Register ONE resize listener (previous code registered on every status update)
		if (!resizeListenerRegistered) {
			resizeListenerRegistered = true;
			window.addEventListener("resize", function () {
				if (resizeTicking) return;
				resizeTicking = true;
				requestAnimationFrame(function () {
					resizeTicking = false;
					updateProgressBarVisibility(document.querySelector(".progress-bar"));
				});
			});
		}

		updateProgressBarVisibility(progressBar);

		if ((status.includes("installing")) ||
			(status.includes("uninstalling")) ||
			(status.includes("stopped"))) {
			// Show the progress of installing/uninstalling apps.
			// (Visibility is handled by updateProgressBarVisibility)


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

	// Initial status check
	if (fs.existsSync("/tmp/progressbar-store/installing")) {
		setTimeout(function () {
			storeStatus = "installing";
			appStoreWorkStatus(storeStatus);
		}, 3000);

	// Read current status once at startup
	try {
		if (fs.existsSync(STATUS_PATH)) {
			storeStatus = fs.readFileSync(STATUS_PATH, "utf8");
			appStoreWorkStatus(storeStatus);
		}
	} catch (e) {
		// ignore
	}

	}

	// Watch for status changes without creating leaking intervals
	try {
		fs.watch(STATUS_PATH, function (event) {
			if (event !== "change") return;
			clearTimeout(statusDebounceTimer);
			statusDebounceTimer = setTimeout(function () {
				try {
					storeStatus = fs.readFileSync(STATUS_PATH, "utf8");
					appStoreWorkStatus(storeStatus);
				} catch (e) {
					// ignore transient read errors
				}
			}, 150);
		});
	} catch (e) {
		// fs.watch can fail on some filesystems; ignore to avoid crashing
	}
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

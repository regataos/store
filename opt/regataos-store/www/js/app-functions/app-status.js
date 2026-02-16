// Checking if apps are being installed or removed
// Performance patch:
// - Avoid repeated require('fs') and repeated file reads inside loops
// - Cache installed-apps.txt and queued-process per tick
// - Cache apps-list JSON parsing by mtime/size
// - Update DOM/classes only when state changes
// - Reduce topbar work (cache state + prefer iframe load event, keep polling fallback)
//
// SECURITY/SCHEMA PATCH (2026-02):
// - JSON schema changed: executable is now an ARRAY (not string)
// - Fix open-button disabling logic to work with array executables
// - Make installed-app detection strict (Set only) to avoid substring false-positives

(function () {
	"use strict";

	const _fs = (window.fs && typeof window.fs.readFileSync === "function") ? window.fs : require("fs");
	if (!window.fs) window.fs = _fs;

	const IFRAME_ID = "iframe-regataos-store";
	const PROGRESS_DIR = "/tmp/progressbar-store";
	const QUEUED_PROCESS_PATH = `${PROGRESS_DIR}/queued-process`;
	const INSTALLED_APPS_PATH = "/opt/regataos-store/installed-apps/installed-apps.txt";
	const APPS_LIST_DIR = "/opt/regataos-store/apps-list";

	// Small cache for text files (mtime/size)
	const _textCache = new Map();
	function _readTextCached(path) {
		try {
			const st = _fs.statSync(path);
			const prev = _textCache.get(path);
			if (prev && prev.mtimeMs === st.mtimeMs && prev.size === st.size) return prev.text;
			const text = _fs.readFileSync(path, "utf8");
			_textCache.set(path, { mtimeMs: st.mtimeMs, size: st.size, text });
			return text;
		} catch (e) {
			_textCache.delete(path);
			return null;
		}
	}

	// Cache parsed app JSON by nickname (mtime/size)
	const _appJsonCache = new Map(); // nick -> {mtimeMs, size, appsArray}
	function _readAppJsonCached(nick) {
		const path = `${APPS_LIST_DIR}/${nick}.json`;
		try {
			const st = _fs.statSync(path);
			const prev = _appJsonCache.get(nick);
			if (prev && prev.mtimeMs === st.mtimeMs && prev.size === st.size) return prev.appsArray;

			const text = _fs.readFileSync(path, "utf8");
			const arr = JSON.parse(text);
			_appJsonCache.set(nick, { mtimeMs: st.mtimeMs, size: st.size, appsArray: arr });
			return arr;
		} catch (e) {
			_appJsonCache.delete(nick);
			return null;
		}
	}

	function _setDisplay(el, displayValue) {
		if (!el) return;
		if (el.style.display !== displayValue) el.style.display = displayValue;
	}
	function _toggleClass(el, cls, on) {
		if (!el) return;
		if (on) el.classList.add(cls);
		else el.classList.remove(cls);
	}

	// Read + parse installed apps once per tick into a Set
	let _installedAppsSet = new Set();
	function _refreshInstalledApps() {
		const txt = _readTextCached(INSTALLED_APPS_PATH) || "";
		const set = new Set();
		txt.split(/\r?\n/).map(s => s.trim()).filter(Boolean).forEach(id => set.add(id));
		_installedAppsSet = set;
	}
	function _isInstalled(nick) {
		// STRICT: avoid substring false-positives (app1 vs app10 etc.)
		return _installedAppsSet.has(nick);
	}

	// Cache queued-process text once per tick
	let _queueText = "";
	function _refreshQueue() {
		_queueText = _readTextCached(QUEUED_PROCESS_PATH) || "";
	}
	function _isQueued(nick, action /* "install"|"remove" */) {
		const token = `${nick}=${action}`;
		return _queueText && _queueText.includes(token);
	}

	// Detect "open disabled" based on executable field in the NEW JSON schema.
	// Accepts:
	// - executable: ["none"]
	// - executable: ["env", "VAR=...", "none"] (if ever used)
	// Keeps backward compatibility if some old JSON still has string executable.
	function _isOpenOffForNick(appNickname) {
		const appsArr = _readAppJsonCached(appNickname);
		if (!Array.isArray(appsArr) || appsArr.length === 0) return false;

		for (let j = 0; j < appsArr.length; j++) {
			const ex = appsArr[j] && appsArr[j].executable;

			if (Array.isArray(ex)) {
				const parts = ex.map(x => String(x || "").trim().toLowerCase()).filter(Boolean);
				if (parts.includes("none")) return true;
			} else if (typeof ex === "string") {
				if (String(ex).toLowerCase().includes("none")) return true;
			}
		}
		return false;
	}

	// Main loop (kept as polling for safety; can be moved to fs.watch later)
	setInterval(appStatus, 500);

	function appStatus() {
		const iframeEl = document.getElementById(IFRAME_ID);
		if (!iframeEl || !iframeEl.contentWindow) return;

		const doc = iframeEl.contentWindow.document;
		if (!doc) return;

		const checkActionButtons = doc.querySelectorAll(".versionapp");
		if (!checkActionButtons || checkActionButtons.length === 0) return;

		_refreshQueue();
		_refreshInstalledApps();

		for (let i = 0; i < checkActionButtons.length; i++) {
			const id = checkActionButtons[i].id || "";
			const parts = id.split("version-");
			const appNickname = parts.length > 1 ? parts[1] : "";
			if (!appNickname) continue;

			// Quick guard: app metadata must exist
			if (!_fs.existsSync(`${APPS_LIST_DIR}/${appNickname}.json`)) continue;

			const appInstallButton = doc.getElementById(`install-${appNickname}`);
			const appRemoveButton = doc.getElementById(`remove-${appNickname}`);
			const appOpenButton = doc.getElementById(`open-${appNickname}`);

			// --- Install button state ---
			if (appInstallButton) {
				const installing = _fs.existsSync(`${PROGRESS_DIR}/installing-${appNickname}`);
				const queuedInstall = !installing && _isQueued(appNickname, "install");

				_toggleClass(appInstallButton, "installing", installing);
				_toggleClass(appInstallButton, "install-queue", queuedInstall);
				_toggleClass(appInstallButton, "install-button", !installing && !queuedInstall);
			}

			// --- Remove button state ---
			if (appRemoveButton) {
				const uninstalling = _fs.existsSync(`${PROGRESS_DIR}/uninstalling-${appNickname}`);
				const queuedRemove = !uninstalling && _isQueued(appNickname, "remove");

				_toggleClass(appRemoveButton, "removing", uninstalling);
				_toggleClass(appRemoveButton, "remove-queue", queuedRemove);
				_toggleClass(appRemoveButton, "remove-button", !uninstalling && !queuedRemove);

				// Open button disabled while uninstalling/queued remove
				if (appOpenButton) _toggleClass(appOpenButton, "open-button-off", uninstalling || queuedRemove);
			}

			// --- Show install/remove/open buttons based on installed state ---
			const installed = _isInstalled(appNickname);

			if (installed) {
				_setDisplay(appInstallButton, "none");
				_setDisplay(appRemoveButton, "block");

				if (appOpenButton) {
					const openOff = _isOpenOffForNick(appNickname);
					_toggleClass(appOpenButton, "open-button-off", openOff || appOpenButton.classList.contains("open-button-off"));
					_setDisplay(appOpenButton, "block");
				}

			} else {
				// Not installed: show install, hide open/remove
				_setDisplay(appInstallButton, "block");
				_setDisplay(appOpenButton, "none");
				_setDisplay(appRemoveButton, "none");
			}
		}
	}

	// --- Topbar visibility ---
	let _lastTopbarVisible = null;

	function updateTopbarVisibility() {
		const iframeEl = document.getElementById(IFRAME_ID);
		const topbar = document.querySelector(".topbar");
		if (!iframeEl || !iframeEl.contentWindow || !topbar) return;

		const href = String(iframeEl.contentWindow.location && iframeEl.contentWindow.location.href || "");
		const visible = href.includes("app-") || href.includes("search?q=");

		if (visible !== _lastTopbarVisible) {
			_lastTopbarVisible = visible;
			topbar.style.display = visible ? "flex" : "none";
		}
	}

	// Prefer event-driven update when iframe reloads
	function attachIframeLoadListenerOnce() {
		const iframeEl = document.getElementById(IFRAME_ID);
		if (!iframeEl || iframeEl.__topbarListenerAttached) return;
		iframeEl.__topbarListenerAttached = true;

		iframeEl.addEventListener("load", () => {
			updateTopbarVisibility();
		});
	}

	attachIframeLoadListenerOnce();

	// Keep a slower polling fallback (some navigations may not trigger load)
	setInterval(() => {
		attachIframeLoadListenerOnce();
		updateTopbarVisibility();
	}, 1500);

})();
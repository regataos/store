// Install and remove Steam games (Regata OS Store)
// Performance patch (step 1–2):
// - Avoid repeated require('fs') / require('child_process') inside the 500ms loop
// - Cache steam-list JSON by mtime/size (avoid re-JSON.parse every tick)
// - Cache "Steam installed?" check by mtime/size (avoid rereading installed-apps.txt every tick)
// - Update DOM only when visibility changes
// - Bind click handlers once (avoid reassigning onclick every 500ms)
// NOTE: Polling is kept for now for safety; next step can replace it with fs.watch on steamapps dir.

(function () {
	"use strict";

	const _fs = (window.fs && typeof window.fs.readFileSync === "function") ? window.fs : require("fs");
	if (!window.fs) window.fs = _fs;

	const _exec = require("child_process").exec;

	const IFRAME_ID = "iframe-regataos-store";
	const STEAM_LIST_DIR = "/opt/regataos-store/steam-list";
	const STEAM_APPS_DIR = "/tmp/regataos-store/config/steamapps";
	const INSTALLED_APPS_PATH = "/opt/regataos-store/installed-apps/installed-apps.txt";

	// Text cache (mtime/size) for installed-apps.txt and any small reads
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

	// Cache parsed game JSON by nickname (mtime/size)
	const _gameJsonCache = new Map(); // nick -> {mtimeMs, size, arr}
	function _readGameJsonCached(gameNickname) {
		const path = `${STEAM_LIST_DIR}/${gameNickname}.json`;
		try {
			const st = _fs.statSync(path);
			const prev = _gameJsonCache.get(gameNickname);
			if (prev && prev.mtimeMs === st.mtimeMs && prev.size === st.size) return prev.arr;

			const text = _fs.readFileSync(path, "utf8");
			const arr = JSON.parse(text);
			_gameJsonCache.set(gameNickname, { mtimeMs: st.mtimeMs, size: st.size, arr });
			return arr;
		} catch (e) {
			_gameJsonCache.delete(gameNickname);
			return null;
		}
	}

	// Cache visibility per nickname to avoid repeated display writes
	const _visibilityCache = new Map(); // nick -> {installVisible:boolean, runVisible:boolean}
	function _setDisplay(el, displayValue) {
		if (!el) return;
		if (el.style.display !== displayValue) el.style.display = displayValue;
	}

	// Only bind click handlers once per element
	function _bindRunClickOnce(el, rungameid) {
		if (!el) return;
		if (el.__steamBound) return;
		el.__steamBound = true;
		el.addEventListener("click", () => {
			_exec(`steam steam://rungameid/${rungameid}`, () => { /* noop */ });
		});
	}

	// Cached "steam installed?" state by installed-apps.txt contents
	let _steamInstalled = null; // boolean|null
	function _refreshSteamInstalled() {
		const installedText = _readTextCached(INSTALLED_APPS_PATH) || "";
		_steamInstalled = installedText.includes("steam");
	}

	setInterval(steamFunctionButtons, 500);

	function steamFunctionButtons() {
		const iframe = document.getElementById(IFRAME_ID);
		if (!iframe || !iframe.contentWindow) return;

		const doc = iframe.contentWindow.document;
		if (!doc) return;

		// Update steam notice only when needed
		const steamNotice = doc.querySelector("#aviso-steam");
		if (steamNotice) {
			_refreshSteamInstalled();
			_setDisplay(steamNotice, _steamInstalled ? "none" : "block");
		}

		const buttons = doc.querySelectorAll(".game-button");
		if (!buttons || buttons.length === 0) return;

		for (let i = 0; i < buttons.length; i++) {
			let gameNickname = buttons[i].id || "";
			if (!gameNickname) continue;

			// Ignore "run game" buttons; we handle them by pairing with the install button's nickname
			if (gameNickname.includes("steam-rungame")) continue;

			gameNickname = gameNickname.split("steam-")[1];
			if (!gameNickname) continue;

			// Load game metadata once (cached)
			const gameArr = _readGameJsonCached(gameNickname);
			if (!Array.isArray(gameArr) || gameArr.length === 0) continue;

			// Find matching entry (keeps original behavior)
			let entry = null;
			for (let j = 0; j < gameArr.length; j++) {
				if (gameArr[j] && typeof gameArr[j].nickname === "string" && gameArr[j].nickname.includes(gameNickname)) {
					entry = gameArr[j];
					break;
				}
			}
			if (!entry || !entry.nickname || !entry.rungameid) continue;

			const runId = entry.rungameid;
			const runEl = doc.getElementById(`steam-rungame-${entry.nickname}`);
			const installEl = doc.getElementById(`steam-${entry.nickname}`);

			// Determine installed state via appmanifest file
			const isInstalled = _fs.existsSync(`${STEAM_APPS_DIR}/appmanifest_${runId}.acf`);

			// Update visibility only when changed
			const prev = _visibilityCache.get(entry.nickname) || { installVisible: null, runVisible: null };
			const wantRunVisible = isInstalled;
			const wantInstallVisible = !isInstalled;

			if (prev.runVisible !== wantRunVisible) {
				_setDisplay(runEl, wantRunVisible ? "block" : "none");
				prev.runVisible = wantRunVisible;
			}
			if (prev.installVisible !== wantInstallVisible) {
				_setDisplay(installEl, wantInstallVisible ? "block" : "none");
				prev.installVisible = wantInstallVisible;
			}
			_visibilityCache.set(entry.nickname, prev);

			// Bind click handlers once (both buttons launch steam://rungameid)
			_bindRunClickOnce(runEl, runId);
			_bindRunClickOnce(installEl, runId);
		}
	}

})();
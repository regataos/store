// Get the app installation progress
// NOTE: incremental performance patch (steps 1–4):
// Step 1: cache file reads (avoid existsSync + readFileSync double work)
// Step 2: update DOM only when values change
// Step 3: cache UI state to avoid repeated DOM work each tick
// Step 4: HYBRID update loop (fs.watch + slower polling fallback)

(function () {
	"use strict";

	// Use a private fs reference to avoid global redeclaration issues in NW.js
	const _fs = (window.fs && typeof window.fs.readFileSync === "function") ? window.fs : require("fs");
	if (!window.fs) window.fs = _fs;

	const DIR = "/tmp/progressbar-store";

	// Very small cache keyed by file path to avoid re-reading unchanged files.
	const _fileCache = new Map();
	function _readTextCached(path) {
		try {
			const st = _fs.statSync(path);
			const prev = _fileCache.get(path);
			if (prev && prev.mtimeMs === st.mtimeMs && prev.size === st.size) return prev.text;
			const text = _fs.readFileSync(path, "utf8");
			_fileCache.set(path, { mtimeMs: st.mtimeMs, size: st.size, text });
			return text;
		} catch (e) {
			_fileCache.delete(path);
			return null;
		}
	}

	// Shared values reused by other logic (avoid extra reads)
	let _lastProgressText = null;
	let _lastFileSizeText = null;
	let _lastAppName = null;
	let _lastStatus = null;
	let _lastEta = null;
	let _lastDownloadSize = null;

	// UI state caches to avoid repeating the same DOM work every tick
	let _lastBarMode = null;        // "movement" | "full" | "full-red" | "installing" | "idle"
	let _lastSpeedVisible = null;   // boolean
	let _lastMoreInfoIconOn = null; // boolean
	let _lastMoreInfoVisible = null;// boolean

	// --- Step 4: Hybrid scheduler (watch + slower polling fallback) ---
	let _tickDebounce = null;
	function tick() {
		// run both; they are already internally cached and update-diffed
		getAppInfo();
		progressBarMovement();
	}

	function scheduleTick() {
		clearTimeout(_tickDebounce);
		_tickDebounce = setTimeout(tick, 100);
	}

	// Run once at startup
	tick();

	// Watch for changes in progressbar-store (primary mechanism)
	try {
		_fs.watch(DIR, () => {
			scheduleTick();
		});
	} catch (e) {
		// If watch fails, we still have fallback polling below
	}

	// Fallback polling: slower than before (keeps resilience)
	setInterval(tick, 1500);

	function getAppInfo() {
		// App name
		const appName = _readTextCached(`${DIR}/app-name`)
			|| _readTextCached(`${DIR}/busy-installer-for.txt`);
		if (appName !== null && appName !== _lastAppName) {
			const el = document.querySelector(".app-installing");
			if (el) el.textContent = appName;
			_lastAppName = appName;
		}

		// Installation progress
		const percentage = _readTextCached(`${DIR}/progress`);
		if (percentage !== null && percentage !== _lastProgressText) {
			_lastProgressText = percentage;

			const elPct = document.querySelector(".percentage");
			if (elPct) elPct.textContent = percentage;

			const elProg = document.querySelector(".progress");
			if (elProg) elProg.style.width = percentage;
		}

		// Installation status
		const status = _readTextCached(`${DIR}/status`);
		if (status !== null && status !== _lastStatus) {
			const el = document.querySelector(".status");
			if (el) el.textContent = status;
			_lastStatus = status;
		}

		// App size
		const fileSize = _readTextCached(`${DIR}/file-size`);
		if (fileSize !== null && fileSize !== _lastFileSizeText) {
			_lastFileSizeText = fileSize;

			const el = document.getElementById("filesize");
			if (el) el.textContent = fileSize;
		}

		// Estimated download time
		const downloadEta = _readTextCached(`${DIR}/eta`);
		if (downloadEta !== null && downloadEta !== _lastEta) {
			const el = document.getElementById("eta");
			if (el) el.textContent = downloadEta;
			_lastEta = downloadEta;
		}

		// Download size
		const downloadSize = _readTextCached(`${DIR}/runtime-download-size`)
			|| _readTextCached(`${DIR}/download-size`);
		if (downloadSize !== null && downloadSize !== _lastDownloadSize) {
			const el = document.getElementById("downsize");
			if (el) el.textContent = downloadSize;
			_lastDownloadSize = downloadSize;
		}
	}

	function progressBarMovement() {
		const elProgress = document.querySelector(".progress");
		const elFull = document.querySelector(".progress-full");
		const elFullRed = document.querySelector(".progress-full-red");
		const elMovement = document.querySelector(".progress-movement");
		const elPct = document.querySelector(".percentage");
		const lightGreyfull = document.querySelector(".light-greyfull");
		const iconMoreInfo = document.querySelector(".more-info");
		const moreInfo = document.querySelector(".down-functions");
		const widthStatus = document.getElementById("status-download");

		// Determine bar mode
		let mode = "idle";
		if (_fs.existsSync(`${DIR}/progress-movement`)) mode = "movement";
		else if (_fs.existsSync(`${DIR}/progress-full`)) mode = "full";
		else if (_fs.existsSync(`${DIR}/progress-full-red`)) mode = "full-red";
		else if (_fs.existsSync(`${DIR}/installing`)) mode = "installing";

		// Apply bar mode only when it changes
		if (mode !== _lastBarMode) {
			_lastBarMode = mode;

			if (elProgress) elProgress.style.display = "none";
			if (elFull) elFull.style.display = "none";
			if (elFullRed) elFullRed.style.display = "none";
			if (elMovement) elMovement.style.display = "none";
			if (elPct) elPct.style.display = "block";
			if (lightGreyfull) lightGreyfull.style.display = "block";

			if (mode === "movement") {
				if (elMovement) elMovement.style.display = "block";
				if (lightGreyfull) lightGreyfull.style.display = "none";
			} else if (mode === "full") {
				if (elFull) elFull.style.display = "block";
			} else if (mode === "full-red") {
				if (elFullRed) elFullRed.style.display = "block";
			} else if (mode === "installing") {
				if (elProgress) elProgress.style.display = "block";
			}
		}

		// Show download speed
		const speedVisible = _fs.existsSync(`${DIR}/speed`);
		if (speedVisible !== _lastSpeedVisible) {
			_lastSpeedVisible = speedVisible;
			const speedInfo = document.querySelectorAll(".dinfo");
			for (let i = 0; i < speedInfo.length; i++) {
				if (speedVisible) speedInfo[i].classList.remove("install-off");
				else speedInfo[i].classList.add("install-off");
			}
		}

		// Set width for status (reuse cached progress text)
		if (widthStatus && _lastProgressText !== null) {
			const wanted = (_lastProgressText.length >= 2) ? "160px" : "205px";
			if (widthStatus.style.maxWidth !== wanted) widthStatus.style.maxWidth = wanted;
		}

		// Set icon for more info button
		if (iconMoreInfo) {
			const on = _fs.existsSync(`${DIR}/queued-1`);
			if (on !== _lastMoreInfoIconOn) {
				_lastMoreInfoIconOn = on;
				iconMoreInfo.style.backgroundImage = on
					? "url(./images/arrow-right-on.png)"
					: "url(./images/arrow-right-off.png)";
			}
		}

		// Display more information
		const fileSizeText = _lastFileSizeText !== null
			? _lastFileSizeText
			: _readTextCached(`${DIR}/file-size`);

		let shouldShow = false;
		if (fileSizeText !== null) {
			const showMoreInfo = fileSizeText.replace("% /", "");
			if (showMoreInfo >= 2) shouldShow = true;
			else if (showMoreInfo === "saved") shouldShow = false;
		}

		if (moreInfo) {
			if (shouldShow !== _lastMoreInfoVisible) {
				_lastMoreInfoVisible = shouldShow;
				moreInfo.style.display = shouldShow ? "block" : "none";
			}
		}
	}

})();

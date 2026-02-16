// app-functions-buttons.js (STRICT SECURITY VERSION)
// Assumptions (per your current store):
// - executable is ALWAYS an array (no legacy string execution)
// - no absolute paths in executable (no "/usr/bin/..." etc.)
// - launchers used: snap, flatpak, and env (wrapper for VAR=VALUE)
// - package / extra_packages are arrays (passed via PACKAGE_JSON / EXTRA_PACKAGES_JSON)
// Security goals:
// - No shell execution anywhere for app launch
// - Strong schema validation + allow-lists
// - No sudo -E (preserve only known env vars)

(function () {
	"use strict";

	// Reuse fs across scripts (NW.js global scope can collide)
	const _fs = (window.fs && typeof window.fs.readFileSync === "function") ? window.fs : require("fs");
	if (!window.fs) window.fs = _fs;

	const { spawn } = require("child_process");

	const IFRAME_ID = "iframe-regataos-store";
	const APPS_LIST_DIR = "/opt/regataos-store/apps-list";
	const EBOOK_LIST_DIR = "/opt/regataos-store/ebook-list";

	const LOG_DIR = "/var/log/regataos-logs";
	const OPEN_LOG_FILE = `${LOG_DIR}/open-log-file.log`;

	// ----------------------------
	// Helpers: caching + DOM
	// ----------------------------

	// Cache parsed JSON by file path using mtime/size
	const _jsonCache = new Map(); // path -> { mtimeMs, size, data }
	function readJsonCached(path) {
		try {
			const st = _fs.statSync(path);
			const prev = _jsonCache.get(path);
			if (prev && prev.mtimeMs === st.mtimeMs && prev.size === st.size) return prev.data;

			const text = _fs.readFileSync(path, "utf8");
			const data = JSON.parse(text);
			_jsonCache.set(path, { mtimeMs: st.mtimeMs, size: st.size, data });
			return data;
		} catch (e) {
			_jsonCache.delete(path);
			return null;
		}
	}

	function setDisplay(el, display) {
		if (!el) return;
		if (el.style.display !== display) el.style.display = display;
	}

	function bindOnce(el, handler) {
		if (!el) return;
		if (el.__boundOnce) return;
		el.__boundOnce = true;
		el.addEventListener("click", handler);
	}

	// ----------------------------
	// Security primitives
	// ----------------------------

	// Block shell metacharacters and control chars
	function hasUnsafeChars(s) {
		return /[;&|`$()<>\\\n\r]/.test(String(s || ""));
	}

	// Only allow "simple" tokens (no whitespace, no quotes, no slashes)
	// Accepts names like: zotero, akregator, org.app.Id, android-studio, foo_bar, foo+bar, foo:bar
	function isSafeToken(tok) {
		const t = String(tok || "").trim();
		if (!t) return false;
		if (hasUnsafeChars(t)) return false;
		// No quotes
		if (/[\"']/.test(t)) return false;
		// No spaces/tabs
		if (/\s/.test(t)) return false;
		// No path separators (prevents "/usr/bin/x", "./x", "a/b")
		if (/[\/]/.test(t)) return false;
		// Keep token charset tight
		return /^[A-Za-z0-9._:+@%=-]+$/.test(t);
	}

	function isSafeEnvAssignment(tok) {
		const t = String(tok || "").trim();
		if (!t) return false;
		if (!isSafeToken(t)) return false;
		// VAR=VALUE, VAR must be shell-variable-like
		const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.+)$/);
		return !!m;
	}

	function isSafeNickname(s) {
		return /^[a-z0-9._-]+$/i.test(String(s || ""));
	}

	function isSafeUrlOrPlaceholder(s) {
		const t = String(s || "").trim();
		if (!t) return true;
		// allow placeholders like [mainRepositoryUrl]
		if (/^\[[A-Za-z0-9_]+\]$/.test(t)) return true;
		// allow http(s) only
		try {
			const u = new URL(t);
			return (u.protocol === "https:" || u.protocol === "http:");
		} catch {
			return false;
		}
	}

	// Allow-list: only these launchers/wrappers can be the first token.
	// Everything else must be a direct binary name (single-token exec).
	const ALLOWED_LAUNCHERS = new Set(["snap", "flatpak", "env"]);

	function validateExecutable(executable) {
		if (!Array.isArray(executable)) return { ok: false, reason: "executable is not an array" };
		const parts = executable.map(x => String(x || "").trim()).filter(Boolean);
		if (parts.length === 0) return { ok: false, reason: "executable is empty" };

		// Validate all tokens
		for (let i = 0; i < parts.length; i++) {
			if (!isSafeToken(parts[i])) return { ok: false, reason: `unsafe token: ${parts[i]}` };
		}

		const cmd = parts[0];

		// Block common interpreter shells even if token-safe
		const blockedCmd = new Set(["sh", "bash", "dash", "zsh", "fish", "python", "python3", "perl", "ruby", "node"]);
		if (blockedCmd.has(cmd)) return { ok: false, reason: `blocked command: ${cmd}` };

		// Launcher rules
		if (ALLOWED_LAUNCHERS.has(cmd)) {
			if (cmd === "env") {
				// env VAR=VALUE ... app
				if (parts.length < 2) return { ok: false, reason: "env needs args" };
				// allow 0+ VAR=VALUE then one app token (and optional args? keep strict: no extra args for now)
				let i = 1;
				while (i < parts.length && parts[i].includes("=")) {
					if (!isSafeEnvAssignment(parts[i])) return { ok: false, reason: `bad env assignment: ${parts[i]}` };
					i++;
				}
				if (i >= parts.length) return { ok: false, reason: "env missing command" };
				// command must be safe token
				if (!isSafeToken(parts[i])) return { ok: false, reason: `bad env command: ${parts[i]}` };
				// Remaining args after command are allowed only if token-safe (already validated)
				return { ok: true, parts };
			}

			if (cmd === "snap") {
				// Only allow: snap run <app>
				if (parts.length !== 3) return { ok: false, reason: "snap must be: snap run <app>" };
				if (parts[1] !== "run") return { ok: false, reason: "snap action must be 'run'" };
				return { ok: true, parts };
			}

			if (cmd === "flatpak") {
				// Only allow: flatpak run <appId>
				if (parts.length < 3) return { ok: false, reason: "flatpak must be: flatpak run <appId> [args]" };
				if (parts[1] !== "run") return { ok: false, reason: "flatpak action must be 'run'" };
				return { ok: true, parts };
			}
		}

		// Direct app execution: must be single-token only
		if (parts.length !== 1) return { ok: false, reason: "direct executables must be single token" };
		return { ok: true, parts };
	}

	function normalizePkgList(v) {
		if (!Array.isArray(v)) return [];
		const parts = v.map(x => String(x || "").trim()).filter(Boolean);
		for (let i = 0; i < parts.length; i++) {
			// For packages, allow a slightly wider charset, but still no metachar and no slashes
			if (!isSafeToken(parts[i])) return null;
		}
		return parts;
	}

	function validateAppSchema(app) {
		if (!app || typeof app !== "object") return { ok: false, reason: "app is not an object" };

		// Required
		if (!isSafeNickname(app.nickname)) return { ok: false, reason: `bad nickname: ${app.nickname}` };

		const pm = String(app.package_manager || "").trim();
		const allowedPM = new Set(["zypper", "flatpak", "snap"]);
		if (!allowedPM.has(pm)) return { ok: false, reason: `unsupported package_manager: ${pm}` };

		// executable
		const ex = validateExecutable(app.executable);
		if (!ex.ok) return { ok: false, reason: `executable invalid: ${ex.reason}` };

		// packages
		const pkg = normalizePkgList(app.package);
		if (pkg === null) return { ok: false, reason: "package contains unsafe token(s)" };

		const extra = normalizePkgList(app.extra_packages);
		if (extra === null) return { ok: false, reason: "extra_packages contains unsafe token(s)" };

		// URLs / placeholders
		if (!isSafeUrlOrPlaceholder(app.repository_url)) return { ok: false, reason: "repository_url invalid" };
		if (!isSafeUrlOrPlaceholder(app.download_link)) return { ok: false, reason: "download_link invalid" };

		// architecture (optional but validate if present)
		const arch = String(app.architecture || "").trim();
		if (arch && !/^(x86_64|aarch64|noarch|i686)$/.test(arch)) {
			return { ok: false, reason: `architecture invalid: ${arch}` };
		}

		return { ok: true, pm, execParts: ex.parts, pkgList: pkg || [], extraList: extra || [] };
	}

	// ----------------------------
	// Process runners (safe)
	// ----------------------------

	function runDetached(cmd, args, envExtra) {
		try {
			const child = spawn(cmd, Array.isArray(args) ? args : [], {
				detached: true,
				stdio: "ignore",
				env: envExtra ? { ...process.env, ...envExtra } : process.env,
			});
			child.unref();
		} catch (e) {
			console.error("runDetached failed:", e);
		}
	}

	function runExecutableStrict(executableArray) {
		const v = validateExecutable(executableArray);
		if (!v.ok) {
			console.error("Blocked executable:", v.reason, executableArray);
			return;
		}
		const parts = v.parts;
		runDetached(parts[0], parts.slice(1));
	}

	// Install/remove: pass PACKAGE_JSON / EXTRA_PACKAGES_JSON and DO NOT use sudo -E
	function runInstallOrRemove(kind /* "install"|"remove" */, app) {
		const v = validateAppSchema(app);
		if (!v.ok) {
			console.error("Blocked app schema:", v.reason, app && app.nickname);
			return;
		}

		const scriptBase = selectTranslationScript(); // existing function in your app
		const scriptPath =
			kind === "install"
				? `${scriptBase}/installapp/installapp-${v.pm}`
				: `${scriptBase}/removeapp/removeapp-${v.pm}`;

		// Minimal env passed to sudo; scripts read PACKAGE_JSON/EXTRA_PACKAGES_JSON.
		const env = {
			name: String(app.name || "").replace(/[\r\n]/g, " ").trim(),
			nickname: String(app.nickname || "").replace(/[\r\n]/g, " ").trim(),

			PACKAGE_JSON: JSON.stringify(v.pkgList),
			EXTRA_PACKAGES_JSON: JSON.stringify(v.extraList),

			// Keep legacy strings for any scripts/tools still using them (derived from arrays)
			package: v.pkgList.join(" "),
			extra_packages: v.extraList.join(" "),

			package_prerm: String(app.package_prerm || "").replace(/[\r\n]/g, " ").trim(),
			package_preinst: String(app.package_preinst || "").replace(/[\r\n]/g, " ").trim(),
			architecture: String(app.architecture || "").replace(/[\r\n]/g, " ").trim(),
			repository_name: String(app.repository_name || "").replace(/[\r\n]/g, " ").trim(),
			repository_url: String(app.repository_url || "").replace(/[\r\n]/g, " ").trim(),
			download_link: String(app.download_link || "").replace(/[\r\n]/g, " ").trim(),
			restart_system: String(app.restart || "").replace(/[\r\n]/g, " ").trim(),
		};

		// Preserve ONLY these vars (avoid sudo -E)
		const preserve = [
			"name",
			"nickname",
			"PACKAGE_JSON",
			"EXTRA_PACKAGES_JSON",
			"package",
			"extra_packages",
			"package_prerm",
			"package_preinst",
			"architecture",
			"repository_name",
			"repository_url",
			"download_link",
			"restart_system",
		].join(",");

		runDetached("sudo", [`--preserve-env=${preserve}`, scriptPath], env);

		// Keep original behavior: run hybrid graphics script as well
		runDetached("sudo", ["/opt/regataos-prime/scripts/apps-hybrid-graphics"]);
	}

	// ----------------------------
	// Main: bind buttons once
	// ----------------------------

	function getIframeDoc() {
		const iframe = document.getElementById(IFRAME_ID);
		if (!iframe || !iframe.contentWindow) return null;
		return iframe.contentWindow.document || null;
	}

	// Call this when iframe content is ready (you can also call after iframe load)
	window.appButtonsFunction = function appButtonsFunction() {
		const doc = getIframeDoc();
		if (!doc) return;

		const versionApps = doc.querySelectorAll(".versionapp");
		if (versionApps && versionApps.length) {
			for (let i = 0; i < versionApps.length; i++) {
				const id = String(versionApps[i].id || "");
				const appNickname = id.includes("version-") ? id.split("version-")[1] : "";
				if (!appNickname || !isSafeNickname(appNickname)) {
					console.error("Blocked invalid versionapp id:", id);
					continue;
				}

				const appJsonPath = `${APPS_LIST_DIR}/${appNickname}.json`;
				const apps = readJsonCached(appJsonPath);

				if (Array.isArray(apps)) {
					for (let j = 0; j < apps.length; j++) {
						const app = apps[j];
						const ok = validateAppSchema(app);
						if (!ok.ok) {
							console.error("Skipping app due to schema validation:", ok.reason);
							continue;
						}

						// Open app (strict)
						const openBtn = doc.getElementById(`open-${app.nickname}`);
						bindOnce(openBtn, () => runExecutableStrict(app.executable));

						// Install app
						const installBtn = doc.getElementById(`install-${app.nickname}`);
						bindOnce(installBtn, () => runInstallOrRemove("install", app));

						// Remove app
						const removeBtn = doc.getElementById(`remove-${app.nickname}`);
						bindOnce(removeBtn, () => runInstallOrRemove("remove", app));
					}
				}
			}
		}

		// Ebook links (restrict to http/https)
		const ebookCards = doc.querySelectorAll(".show-ebook");
		if (ebookCards && ebookCards.length) {
			for (let i = 0; i < ebookCards.length; i++) {
				setDisplay(ebookCards[i], "block");
			}
		}

		// ebook-list binding
		// (kept separate so we don't rely on app schema for ebooks)
		const ebookAnchors = doc.querySelectorAll("[id^='open-page-']");
		if (ebookAnchors && ebookAnchors.length) {
			for (let i = 0; i < ebookAnchors.length; i++) {
				const el = ebookAnchors[i];
				const id = String(el.id || "");
				// We'll still bind once; URL is pulled from ebook JSON in older structure, so keep original loop below too.
				el.__boundOnce = el.__boundOnce || false;
			}
		}

		// Original ebook-list reading (safe xdg-open only for http/https)
		const versionApps2 = doc.querySelectorAll(".versionapp");
		if (versionApps2 && versionApps2.length) {
			for (let i = 0; i < versionApps2.length; i++) {
				const id = String(versionApps2[i].id || "");
				const appNickname = id.includes("version-") ? id.split("version-")[1] : "";
				if (!appNickname || !isSafeNickname(appNickname)) continue;

				const ebookJsonPath = `${EBOOK_LIST_DIR}/${appNickname}.json`;
				const ebooks = readJsonCached(ebookJsonPath);
				if (!Array.isArray(ebooks)) continue;

				for (let j = 0; j < ebooks.length; j++) {
					const ebook = ebooks[j];
					if (!ebook || !isSafeNickname(ebook.nickname)) continue;

					const openPageBtn = doc.getElementById(`open-page-${ebook.nickname}`);
					bindOnce(openPageBtn, () => {
						const url = String(ebook.salepage || "").trim();
						if (!url) return;
						try {
							const u = new URL(url);
							if (u.protocol !== "https:" && u.protocol !== "http:") {
								console.error("Blocked non-http(s) ebook URL:", url);
								return;
							}
						} catch {
							console.error("Blocked invalid ebook URL:", url);
							return;
						}
						runDetached("xdg-open", [url]);
					});
				}
			}
		}
	};

	// Auto-run when iframe loads/navigates
	function attachIframeLoadHook() {
		const iframe = document.getElementById(IFRAME_ID);
		if (!iframe || iframe.__appButtonsHooked) return;
		iframe.__appButtonsHooked = true;
		iframe.addEventListener("load", () => {
			window.appButtonsFunction();
		});
	}
	attachIframeLoadHook();

	// ----------------------------
	// openLogFile: switch to fs.watch (already event-driven)
	// ----------------------------

	function openLogFile() {
		try {
			if (!_fs.existsSync(OPEN_LOG_FILE)) return;

			let appNickname = _fs.readFileSync(OPEN_LOG_FILE, "utf8");
			appNickname = appNickname.replace(/(\r\n|\n|\r)/gm, "").replace(/ /g, "");

			// Validate nickname-ish to avoid weird path traversal
			if (!isSafeNickname(appNickname)) {
				console.error("Blocked log open for invalid nickname:", appNickname);
				try { _fs.unlinkSync(OPEN_LOG_FILE); } catch (_) {}
				return;
			}

			// Delete trigger file without shell
			try { _fs.unlinkSync(OPEN_LOG_FILE); } catch (_) {}

			// Open log file (detached). File path is fixed-format.
			runDetached("kwrite", [`${LOG_DIR}/install-app-${appNickname}.log`]);
		} catch (e) {
			console.error("openLogFile error:", e);
		}
	}

	let _openLogDebounce = null;
	try {
		_fs.watch(LOG_DIR, (eventType, filename) => {
			if (filename !== "open-log-file.log") return;
			clearTimeout(_openLogDebounce);
			_openLogDebounce = setTimeout(openLogFile, 100);
		});
	} catch (e) {
		// Fallback polling (slower than before)
		setInterval(openLogFile, 3000);
	}

	openLogFile();

})();
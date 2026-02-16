(function () {
	"use strict";

	const _fs = (window.fs && typeof window.fs.readFileSync === "function") ? window.fs : require("fs");
	if (!window.fs) window.fs = _fs;

	const APPS_LIST_DIR = "/opt/regataos-store/apps-list";
	const BASE_VERSION_PATH = "/usr/share/regataos/regataos-base-version.txt";

	// ----------------------------
	// Cache helpers
	// ----------------------------
	const _jsonCache = new Map(); // path -> {mtimeMs,size,data}
	function readJsonCached(path) {
		try {
			const st = _fs.statSync(path);
			const prev = _jsonCache.get(path);
			if (prev && prev.mtimeMs === st.mtimeMs && prev.size === st.size) return prev.data;

			const text = _fs.readFileSync(path, "utf8");
			const data = JSON.parse(text);
			_jsonCache.set(path, { mtimeMs: st.mtimeMs, size: st.size, data });
			return data;
		} catch {
			_jsonCache.delete(path);
			return null;
		}
	}

	const _textCache = new Map(); // path -> {mtimeMs,size,text}
	function readTextCached(path) {
		try {
			const st = _fs.statSync(path);
			const prev = _textCache.get(path);
			if (prev && prev.mtimeMs === st.mtimeMs && prev.size === st.size) return prev.text;

			const text = _fs.readFileSync(path, "utf8");
			_textCache.set(path, { mtimeMs: st.mtimeMs, size: st.size, text });
			return text;
		} catch {
			_textCache.delete(path);
			return null;
		}
	}

	// Cache de versões remotas (reduz rede)
	const _remoteVersionCache = new Map(); // key -> version|null
	function getCachedRemote(key) {
		return _remoteVersionCache.has(key) ? _remoteVersionCache.get(key) : undefined;
	}
	function setCachedRemote(key, value) {
		_remoteVersionCache.set(key, value);
		return value;
	}

	// Normalize package (novo schema: array)
	function getPkg0(pkg) {
		if (Array.isArray(pkg)) return String(pkg[0] || "").trim();
		return String(pkg || "").trim();
	}

	function isX64FromJsonText(jsonText) {
		// mantém a heurística antiga, mas sem depender de variáveis erradas
		return typeof jsonText === "string" && jsonText.includes("x86_64");
	}

	// ----------------------------
	// RPM version (zypper/rpm)
	// ----------------------------
	function rpmVersion(appNickname) {
		try {
			const jsonPath = `${APPS_LIST_DIR}/${appNickname}.json`;
			if (!_fs.existsSync(jsonPath)) return null;

			// Para manter o "searchArch" parecido com o original, pegamos o texto do JSON
			const jsonText = readTextCached(jsonPath);
			const appData = jsonText ? JSON.parse(jsonText) : null;
			if (!Array.isArray(appData)) return null;

			const baseVersionText = readTextCached(BASE_VERSION_PATH);
			if (!baseVersionText) return null;

			const searchValue = isX64FromJsonText(jsonText) ? "x86_64" : "noarch";

			for (let i = 0; i < appData.length; i++) {
				const pkg0 = getPkg0(appData[i].package);
				const repositoryCache = String(appData[i].repository_cache || "");

				if (!pkg0) continue;

				// resolve repository file
				let repositoryFile;
				if (repositoryCache.includes("basedOnVersion")) {
					let baseRepo = baseVersionText.match(/(?<=basedOnVersion=).*/g);
					if (!baseRepo || !baseRepo[0]) continue;
					baseRepo = repositoryCache.replace(/\[basedOnVersion\]/g, baseRepo[0]);
					repositoryFile = `${baseRepo}/solv.idx`;
				} else if (repositoryCache.includes("mainRepositoryName")) {
					const mainRepository = baseVersionText.match(/(?<=mainRepositoryName=).*/g);
					if (!mainRepository || !mainRepository[0]) continue;
					repositoryFile = `/var/cache/zypp/solv/${mainRepository[0]}/solv.idx`;
				} else {
					repositoryFile = `${repositoryCache}/solv.idx`;
				}

				const v = captureAppVersion(repositoryFile, pkg0, searchValue);
				if (v) return v;
			}
			return null;
		} catch (e) {
			console.error(`  ✗ Erro ao buscar versão RPM para ${appNickname}:`, e.message);
			return null;
		}
	}

	function captureAppVersion(repositoryFile, pkg0, archToken) {
		if (!_fs.existsSync(repositoryFile)) return null;

		try {
			// lê o solv.idx uma vez
			let repoFile = readTextCached(repositoryFile);
			if (!repoFile) return null;

			// Mantém ideia do original: limpar linhas “-pkg...” e “pkg-...”
			// OBS: ainda é heurística; a forma ideal é parsear o solv.idx, mas isso já ajuda.
			const prepareString1 = new RegExp(`-${escapeRegExp(pkg0)}.*`, "gm");
			const prepareString2 = new RegExp(`${escapeRegExp(pkg0)}-.*`, "gm");
			repoFile = repoFile.replace(prepareString1, "").replace(prepareString2, "");

			const searchArch = new RegExp(`(?<=${escapeRegExp(pkg0)}).*${escapeRegExp(archToken)}`, "g");
			const match = repoFile.match(searchArch);
			if (!match || !match[0]) return null;

			let appVersion = match[0].replace(/-.*/g, "").trim();
			return appVersion || null;
		} catch (error) {
			console.log(`  ✗ Erro ao processar repositório: ${error.message}`);
			return null;
		}
	}

	function escapeRegExp(s) {
		return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}

	// ----------------------------
	// Flatpak / Snap (remote)
	// ----------------------------
	async function getFlathubVersion(appId) {
		const key = `flatpak:${appId}`;
		const cached = getCachedRemote(key);
		if (cached !== undefined) return cached;

		try {
			const response = await fetch(`https://flathub.org/api/v2/appstream/${encodeURIComponent(appId)}`);
			if (!response.ok) return setCachedRemote(key, null);

			const data = await response.json();
			const ver =
				(data.releases && data.releases.length > 0 && data.releases[0].version) ||
				data.version ||
				null;

			return setCachedRemote(key, ver);
		} catch (e) {
			console.error("Erro ao buscar versão Flatpak:", e.message);
			return setCachedRemote(key, null);
		}
	}

	async function getSnapVersion(snapName) {
		const key = `snap:${snapName}`;
		const cached = getCachedRemote(key);
		if (cached !== undefined) return cached;

		try {
			const response = await fetch(`https://api.snapcraft.io/v2/snaps/info/${encodeURIComponent(snapName)}`, {
				headers: { "Snap-Device-Series": "16" }
			});
			if (!response.ok) return setCachedRemote(key, null);

			const data = await response.json();
			let ver = null;

			if (data["channel-map"] && data["channel-map"].length > 0) {
				const stable = data["channel-map"].find(ch => ch.channel && ch.channel.name === "stable");
				ver = (stable && stable.version) || data["channel-map"][0].version || null;
			}

			return setCachedRemote(key, ver);
		} catch (e) {
			console.error("Erro ao buscar versão Snap:", e.message);
			return setCachedRemote(key, null);
		}
	}

	async function nonRpmVersion(appNickname) {
		const jsonPath = `${APPS_LIST_DIR}/${appNickname}.json`;
		const appData = readJsonCached(jsonPath);
		if (!Array.isArray(appData)) return null;

		for (let i = 0; i < appData.length; i++) {
			const pm = String(appData[i].package_manager || "").trim();
			const pkg0 = getPkg0(appData[i].package);
			if (!pm || !pkg0) continue;

			if (pm === "flatpak") {
				const v = await getFlathubVersion(pkg0);
				if (v) return v;
			} else if (pm === "snap") {
				const v = await getSnapVersion(pkg0);
				if (v) return v;
			}
		}
		return null;
	}

	// ----------------------------
	// Main
	// ----------------------------
	async function appVersion() {
		const iframe = document.getElementById("iframe-regataos-store");
		if (!iframe || !iframe.contentWindow) return;

		const doc = iframe.contentWindow.document;
		if (!doc) return;

		const nodes = doc.querySelectorAll(".versionapp");
		if (!nodes || nodes.length === 0) return;

		// Sequencial por segurança (evita enxurrada de requests).
		// Se quiser acelerar: dá pra colocar um limitador de concorrência.
		for (let i = 0; i < nodes.length; i++) {
			const id = String(nodes[i].id || "");
			const appNickname = id.includes("version-") ? id.split("version-")[1] : "";
			if (!appNickname) continue;

			const jsonPath = `${APPS_LIST_DIR}/${appNickname}.json`;
			if (!_fs.existsSync(jsonPath)) continue;

			const versionElement = doc.getElementById(`version-${appNickname}`);
			if (!versionElement) continue;

			let v = await nonRpmVersion(appNickname);
			if (!v) v = rpmVersion(appNickname);

			if (v) {
				versionElement.textContent = v; // mais seguro que innerHTML
			} else {
				// opcional: limpar/placeholder
				// versionElement.textContent = "";
				console.log(`  ✗ Nenhuma versão encontrada para: ${appNickname}`);
			}
		}

		console.log("Processo concluído!");
	}

	// exponha se você chama de outro lugar
	window.appVersion = appVersion;

})();

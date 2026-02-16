// installedPage (patched)
// - Reads installed-apps.txt once -> Set (no substring false positives)
// - Loads app JSON files in parallel (Promise.all)
// - Creates DOM nodes safely (no innerHTML with untrusted values)
// - Calls refreshRatingsInIframe() once after all insertions
// - Disables draggable only where needed, and only once per page load

async function installedPage() {
	const _fs = (window.fs && typeof window.fs.readFileSync === "function") ? window.fs : require("fs");
	if (!window.fs) window.fs = _fs;

	const iframe = document.getElementById("iframe-regataos-store");
	if (!iframe || !iframe.contentWindow) return;

	const win = iframe.contentWindow;
	const doc = win.document;
	if (!doc) return;

	const href = String(win.location && win.location.href || "");
	if (!href.includes("apps-installed2")) return;

	const APPS_DIR = "/opt/regataos-store/apps-list";
	const INSTALLED_PATH = "/opt/regataos-store/installed-apps/installed-apps.txt";

	// ---- read installed apps once (strict Set) ----
	let installedSet = new Set();
	try {
		const installedTxt = _fs.existsSync(INSTALLED_PATH) ? _fs.readFileSync(INSTALLED_PATH, "utf8") : "";
		installedTxt
			.split(/\r?\n/)
			.map(s => s.trim())
			.filter(Boolean)
			.forEach(nick => installedSet.add(nick));
	} catch (e) {
		console.error("installedPage: failed reading installed-apps.txt", e);
		return;
	}

	// ---- read all json files (parallel) ----
	let files = [];
	try {
		files = _fs.readdirSync(APPS_DIR).filter(f => f.endsWith(".json"));
	} catch (e) {
		console.error("installedPage: failed listing apps-list dir", e);
		return;
	}

	const fsp = _fs.promises;

	const jsonPromises = files.map(async (fname) => {
		const full = `${APPS_DIR}/${fname}`;
		try {
			const txt = await fsp.readFile(full, "utf8");
			const arr = JSON.parse(txt);
			return Array.isArray(arr) ? arr : [];
		} catch {
			return [];
		}
	});

	const allAppsArrays = await Promise.all(jsonPromises);

	// Flatten (each file is an array of objects)
	const allApps = [];
	for (const arr of allAppsArrays) {
		for (const app of arr) {
			if (app && typeof app === "object") allApps.push(app);
		}
	}

	// ---- create blocks (only if not shown in store AND installed) ----
	let createdCount = 0;

	for (const app of allApps) {
		const showStore = !!app.show_store;
		const nickname = String(app.nickname || "").trim();
		const name = String(app.name || "").trim();
		const icon = String(app.icon_backg || "").trim();
		const price = String(app.price || "").trim().toLowerCase();

		if (!nickname || !name) continue;
		if (showStore) continue;
		if (!installedSet.has(nickname)) continue;

		const firstLetter = name.substring(0, 1).toLowerCase();
		const dad = doc.querySelector(`div#all-apps-${cssEscape(firstLetter)}`);
		if (!dad) continue;

		// already exists?
		if (dad.querySelector(`a#${cssEscape(nickname)}`)) continue;

		// <a href="...">
		const a = doc.createElement("a");
		a.id = nickname;
		a.href = `${setMainUrl()}/app-${nickname}`;
		a.draggable = false;

		// <div class="app">
		const appDiv = doc.createElement("div");
		appDiv.className = "app";
		appDiv.style.paddingTop = "0px";
		appDiv.draggable = false;

		// <div class="bloco"><img ...></div>
		const bloco = doc.createElement("div");
		bloco.className = "bloco";
		bloco.draggable = false;

		const img = doc.createElement("img");
		img.src = icon;
		img.title = name;
		img.alt = name;
		img.draggable = false;
		bloco.appendChild(img);

		// <div class="cloco-texto">
		const texto = doc.createElement("div");
		texto.className = "cloco-texto";
		texto.draggable = false;

		const pName = doc.createElement("p");
		pName.className = "app-nome";
		pName.textContent = name;

		const info = doc.createElement("div");
		info.className = "bloco-info-app";
		info.draggable = false;

		const rating = doc.createElement("div");
		rating.className = "rw-rating-display compact";
		rating.setAttribute("data-app", nickname);

		const pPrice = doc.createElement("p");
		// mantém compatibilidade com seu CSS atual:
		pPrice.className = price ? `display-price price-${price}` : "display-price";
		pPrice.draggable = false;

		info.appendChild(rating);
		info.appendChild(pPrice);

		texto.appendChild(pName);
		texto.appendChild(info);

		appDiv.appendChild(bloco);
		appDiv.appendChild(texto);
		a.appendChild(appDiv);

		dad.appendChild(a);

		// show alphabet section
		const alphabetId = `apps-${firstLetter}`;
		const alphaEl = doc.getElementById(alphabetId);
		if (alphaEl) alphaEl.style.display = "block";

		createdCount++;
	}

	// Only now: init ratings once
	if (createdCount > 0) {
		refreshRatingsInIframe();
	}

	// Optional: disable draggable broadly ONCE per page (lightweight guard)
	if (!win.__installedPageDraggableOff) {
		win.__installedPageDraggableOff = true;
		// Better than iterating all div/a: disable only imgs + links (usually enough)
		const imgs = doc.querySelectorAll("img");
		for (let i = 0; i < imgs.length; i++) imgs[i].draggable = false;

		const links = doc.querySelectorAll("a");
		for (let i = 0; i < links.length; i++) links[i].draggable = false;
	}
}

// CSS.escape fallback (older Chromium/NW versions)
function cssEscape(s) {
	if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(String(s));
	return String(s).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function refreshRatingsInIframe() {
	const iframe = document.getElementById("iframe-regataos-store");
	if (!iframe || !iframe.contentWindow) return;

	const win = iframe.contentWindow;
	const doc = win.document;

	// Se o init já existe no iframe, só chama
	if (typeof win.init === "function") {
		try { win.init(); } catch (e) { console.error("ratings init error:", e); }
		return;
	}

	// Se ainda não carregou, injeta o script UMA vez
	if (doc.querySelector("script[data-rating-display-only]")) return;

	const s = doc.createElement("script");
	s.src = "https://mediumblue-caribou-984238.hostingersite.com/api-votos/rating-display-only.js?v=1.0.10";
	s.defer = true;
	s.setAttribute("data-rating-display-only", "1");

	s.onload = () => {
		if (typeof win.init === "function") {
			try { win.init(); } catch (e) { console.error("ratings init error:", e); }
		} else {
			console.error("ratings script loaded but init() not found in iframe");
		}
	};

	doc.head.appendChild(s);
}

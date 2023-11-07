// Run the function according to the open app page
function versionRpm(appNickname) {
	const fs = require('fs');

	const data = fs.readFileSync(`/opt/regataos-store/apps-list/${appNickname}.json`, "utf8");
	const appDate = JSON.parse(data);

	for (let i = 0; i < appDate.length; i++) {
		const package = appDate[i].package
		const repositoryCache = appDate[i].repository_cache
		const repositoryName = fs.readFileSync("/usr/share/regataos/regataos-base-version.txt", "utf8");

		function captureAppVersion(repositoryFile) {
			const prepareString1 = new RegExp(`-${package}.*`, "gm");
			const prepareString2 = new RegExp(`${package}-.*`, "gm");

			let repoFile = fs.readFileSync(repositoryFile, "utf8");
			repoFile = repoFile.replace(prepareString1, "").replace(prepareString2, "");

			const searchValue = data.includes("x86_64") ? "x86_64" : "noarch";
			const searchArch = new RegExp(`(?<=${package}).*${searchValue}`, "g");
			let appVersion = repoFile.match(searchArch)[0];
			appVersion = appVersion.replace(/-.*/g, "").trim();
			return appVersion;
		}

		if (repositoryCache.includes("basedOnVersion")) {
			let baseRepo = repositoryName.match(/(?<=basedOnVersion=).*/g)[0];
			baseRepo = repositoryCache.replace(/\[basedOnVersion\]/g, baseRepo);
			const repositoryFile = `${baseRepo}/solv.idx`;
			return captureAppVersion(repositoryFile);

		} else if (repositoryCache.includes("mainRepositoryName")) {
			const mainRepository = repositoryName.match(/(?<=mainRepositoryName=).*/g)[0];
			const repositoryFile = `/var/cache/zypp/solv/${mainRepository}/solv.idx`;
			return captureAppVersion(repositoryFile);

		} else {
			const repositoryFile = `${repositoryCache}/solv.idx`;
			return captureAppVersion(repositoryFile);
		}
	}
}

function appVersion() {
	const captureIframe = document.getElementById("iframe-regataos-store").contentWindow;
	const packageVersion = captureIframe.document.querySelectorAll(".versionapp");

	if (packageVersion) {
		for (let i = 0; i < packageVersion.length; i++) {
			let appNickname = packageVersion[i].id.split("version-")[1];

			if (fs.existsSync(`/opt/regataos-store/apps-list/${appNickname}.json`)) {
				const snapCacheVersion = fs.readFileSync("/opt/regataos-store/installed-apps/snap-version-cache.txt", "utf8");
				const flatpakCacheVersion = fs.readFileSync("/opt/regataos-store/installed-apps/flatpak-version-cache.txt", "utf8");

				const versionElement = captureIframe.document.getElementById(`version-${appNickname}`);

				function findAppVersion(cache, appNickname) {
					const searchString = new RegExp(`(?<=${appNickname}).*`, "g");
					const match = cache.match(searchString);
					return match ? match[0] : null;
				}

				let appVersion = findAppVersion(snapCacheVersion, appNickname);
				if (appVersion !== null) {
					versionElement.innerHTML = appVersion;
				} else {
					appVersion = findAppVersion(flatpakCacheVersion, appNickname);
					if (appVersion !== null) {
						versionElement.innerHTML = appVersion;
					} else {
						versionElement.innerHTML = versionRpm(appNickname);
					}
				}
			}
		}
	}
}

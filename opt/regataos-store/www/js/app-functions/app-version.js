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

			if ((repoFile.indexOf("x86_64") > -1) == "1") {
				const searchArch = new RegExp(`(?<=${package}).*x86_64`, "g");

				let appVersion = repoFile.match(searchArch)[0];
				appVersion = appVersion.replace(/-.*/g, "").trim();
				return appVersion;

			} else if ((repoFile.indexOf("noarch") > -1) == "1") {
				const searchArch = new RegExp(`(?<=${package}).*noarch`, "g");

				let appVersion = repoFile.match(searchArch)[0];
				appVersion = appVersion.replace(/-.*/g, "").trim();
				return appVersion;
			}
		}

		if ((repositoryCache.indexOf("basedOnVersion") > -1) == "1") {
			let baseRepo = repositoryName.match(/(?<=basedOnVersion=).*/g)[0];
			baseRepo = repositoryCache.replace(/\[basedOnVersion\]/g, baseRepo);
			const repositoryFile = `${baseRepo}/solv.idx`;
			return captureAppVersion(repositoryFile);

		} else if ((repositoryCache.indexOf("mainRepositoryName") > -1) == "1") {
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
	const fs = require('fs');

	const captureIframe = document.getElementById("iframe-regataos-store").contentWindow;
	const pageUrl = captureIframe.location.href

	if ((pageUrl.indexOf("app-") > -1) == "1") {
		const appNickname = pageUrl.split("app-")[1];

		if (fs.existsSync(`/opt/regataos-store/apps-list/${appNickname}.json`)) {
			const snapCahceVersion = fs.readFileSync("/opt/regataos-store/installed-apps/snap-version-cache.txt", "utf8");
			const flatpakCahceVersion = fs.readFileSync("/opt/regataos-store/installed-apps/flatpak-version-cache.txt", "utf8");

			if ((snapCahceVersion.indexOf(appNickname) > -1) == "1") {
				const searchString = new RegExp(`(?<=${appNickname}).*`, "g");
				const appVersion = snapCahceVersion.match(searchString)[0];

				captureIframe.document.getElementById(`version-${appNickname}`).innerHTML = appVersion;

			} else if ((flatpakCahceVersion.indexOf(appNickname) > -1) == "1") {
				const searchString = new RegExp(`(?<=${appNickname}).*`, "g");
				const appVersion = flatpakCahceVersion.match(searchString)[0];

				captureIframe.document.getElementById(`version-${appNickname}`).innerHTML = appVersion;

			} else {
				captureIframe.document.getElementById(`version-${appNickname}`).innerHTML = versionRpm(appNickname);
			}
		}
	}
}

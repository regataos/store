// Run the function according to the open app page
function versionRpm(appNickname) {
	const fs = require('fs');

	const data = fs.readFileSync(`/opt/regataos-store/apps-list/${appNickname}.json`, "utf8");
	const appDate = JSON.parse(data);

	for (let i = 0; i < appDate.length; i++) {
		const package = appDate[i].package
		const repositoryCache = appDate[i].repository_cache
		const RepositoryName = fs.readFileSync("/usr/share/regataos/regataos-base-version.txt", "utf8");

		if ((repositoryCache.indexOf("mainRepositoryName") > -1) == "1") {
			let mainRepository = RepositoryName.match(/(?<=mainRepositoryName=).*/g)[0];

			const RepositoryFile = fs.readFileSync(`/var/cache/zypp/solv/${mainRepository}/solv.idx`, "utf8");
			const searchString = new RegExp(`(?<=srcpackage:${package}).*`, "g");
			let appVersion = RepositoryFile.match(searchString)[0];
			appVersion = appVersion.replace(/-.*/g, "").trim();
			return appVersion;

		} else if ((repositoryCache.indexOf("basedOnVersion") > -1) == "1") {
			let baseRepo = RepositoryName.match(/(?<=basedOnVersion=).*/g)[0];
			baseRepo = repositoryCache.replace(/\[basedOnVersion\]/g, baseRepo);

			const prepareString1 = new RegExp(`-${package}.*`, "gm");
			const prepareString2 = new RegExp(`${package}-.*`, "gm");

			let RepositoryFile = fs.readFileSync(`${baseRepo}/solv.idx`, "utf8");
			RepositoryFile = RepositoryFile.replace(prepareString1, "").replace(prepareString2, "");

			const searchString = new RegExp(`(?<=${package}).*x86_64`, "g");

			if (searchString) {
				let appVersion = RepositoryFile.match(searchString)[0];
				appVersion = appVersion.replace(/-.*/g, "").trim();
				return appVersion;

			} else {
				const searchString = new RegExp(`(?<=${package}).*noarch`, "g");
				let appVersion = RepositoryFile.match(searchString)[0];
				appVersion = appVersion.replace(/-.*/g, "").trim();
				return appVersion;
			}

		} else {
			const RepositoryFile = fs.readFileSync(`${repositoryCache}/solv.idx`, "utf8");
			const searchString = new RegExp(`(?<=${package}).*`, "g");
			let appVersion = RepositoryFile.match(searchString)[0];
			appVersion = appVersion.replace(/-.*/g, "").trim();
			return appVersion;
		}
	}
}

function appVersion() {
	const fs = require('fs');

	const captureIframe = document.getElementById("iframe-regataos-store").contentWindow;
	const pageUrl = captureIframe.location.href
	const appNickname = pageUrl.split("app-")[1];

	if ((pageUrl.indexOf(appNickname) > -1) == "1") {
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

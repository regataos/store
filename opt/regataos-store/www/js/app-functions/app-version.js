// Run the function according to the open app page
function rpmVersion(appNickname) {
	const fs = require('fs');

	try {
		const dataPath = `/opt/regataos-store/apps-list/${appNickname}.json`;
		if (!fs.existsSync(dataPath)) {
			console.log(`  ✗ Arquivo JSON não encontrado: ${dataPath}`);
			return null;
		}

		const data = fs.readFileSync(dataPath, "utf8");
		const appDate = JSON.parse(data);

		for (let i = 0; i < appDate.length; i++) {
			const package = appDate[i].package;
			const repositoryCache = appDate[i].repository_cache;
			
			const baseVersionPath = "/usr/share/regataos/regataos-base-version.txt";
			if (!fs.existsSync(baseVersionPath)) {
				console.log(`  ✗ Arquivo base version não encontrado: ${baseVersionPath}`);
				continue;
			}

			const repositoryName = fs.readFileSync(baseVersionPath, "utf8");
			
			function captureAppVersion(repositoryFile) {
				if (!fs.existsSync(repositoryFile)) {
					console.log(`  ✗ Arquivo de repositório não encontrado: ${repositoryFile}`);
					return null;
				}

				try {
					const prepareString1 = new RegExp(`-${package}.*`, "gm");
					const prepareString2 = new RegExp(`${package}-.*`, "gm");
					let repoFile = fs.readFileSync(repositoryFile, "utf8");
					repoFile = repoFile.replace(prepareString1, "").replace(prepareString2, "");
					const searchValue = data.includes("x86_64") ? "x86_64" : "noarch";
					const searchArch = new RegExp(`(?<=${package}).*${searchValue}`, "g");
					let match = repoFile.match(searchArch);

					if (!match || match.length === 0) {
						console.log(`  ✗ Versão não encontrada no repositório para: ${package}`);
						return null;
					}

					let appVersion = match[0];
					appVersion = appVersion.replace(/-.*/g, "").trim();
					return appVersion;
				} catch (error) {
					console.log(`  ✗ Erro ao processar repositório: ${error.message}`);
					return null;
				}
			}

			let repositoryFile;

			if (repositoryCache.includes("basedOnVersion")) {
				let baseRepo = repositoryName.match(/(?<=basedOnVersion=).*/g);
				if (!baseRepo || baseRepo.length === 0) {
					console.log(`  ✗ basedOnVersion não encontrado`);
					continue;
				}
				baseRepo = repositoryCache.replace(/\[basedOnVersion\]/g, baseRepo[0]);
				repositoryFile = `${baseRepo}/solv.idx`;
			} else if (repositoryCache.includes("mainRepositoryName")) {
				const mainRepository = repositoryName.match(/(?<=mainRepositoryName=).*/g);
				if (!mainRepository || mainRepository.length === 0) {
					console.log(`  ✗ mainRepositoryName não encontrado`);
					continue;
				}
				repositoryFile = `/var/cache/zypp/solv/${mainRepository[0]}/solv.idx`;
			} else {
				repositoryFile = `${repositoryCache}/solv.idx`;
			}

			const version = captureAppVersion(repositoryFile);
			if (version) {
				return version;
			}
		}

		return null;
		
	} catch (error) {
		console.error(`  ✗ Erro ao buscar versão RPM para ${appNickname}:`, error.message);
		return null;
	}
}

async function nonRpmVersion(appNickname) {
	const fs = require('fs');

	async function getFlathubVersion(appId) {
		try {
			const response = await fetch(`https://flathub.org/api/v2/appstream/${appId}`);
			if (!response.ok) {
				throw new Error(`App não encontrado: ${appId}`);
			}
			const data = await response.json();
			if (data.releases && data.releases.length > 0) {
				return data.releases[0].version;
			}
			if (data.version) {
				return data.version;
			}
			return null;
		} catch (error) {
			console.error('Erro ao buscar versão Flatpak:', error.message);
			return null;
		}
	}

	async function getSnapVersion(snapName) {
		try {
			const response = await fetch(`https://api.snapcraft.io/v2/snaps/info/${snapName}`, {
				headers: {
					'Snap-Device-Series': '16'
				}
			});
			if (!response.ok) {
				throw new Error(`Snap não encontrado: ${snapName}`);
			}
			const data = await response.json();
			if (data['channel-map'] && data['channel-map'].length > 0) {
				const stableChannel = data['channel-map'].find(
					channel => channel.channel.name === 'stable'
				);
				if (stableChannel && stableChannel.version) {
					return stableChannel.version;
				}
				return data['channel-map'][0].version;
			}
			return null;
		} catch (error) {
			console.error('Erro ao buscar versão Snap:', error.message);
			return null;
		}
	}

	const data = fs.readFileSync(`/opt/regataos-store/apps-list/${appNickname}.json`, "utf8");
	const getAppId = JSON.parse(data);

	for (let i = 0; i < getAppId.length; i++) {
		let packageId = getAppId[i].package;
		const packageType = getAppId[i].package_manager;

		packageId = packageId.split(' ')[0].trim();
		
		let version = null;

		if (packageType === 'flatpak') {
			version = await getFlathubVersion(packageId);
		} else if (packageType === 'snap') {
			version = await getSnapVersion(packageId);
		}

		if (version) {
			return version;
		}
	}

	return null;
}

async function appVersion() {
	const captureIframe = document.getElementById("iframe-regataos-store").contentWindow;
	const packageVersion = captureIframe.document.querySelectorAll(".versionapp");

	if (packageVersion) {
		for (let i = 0; i < packageVersion.length; i++) {
			let appNickname = packageVersion[i].id.split("version-")[1];

			if (fs.existsSync(`/opt/regataos-store/apps-list/${appNickname}.json`)) {
				const versionElement = captureIframe.document.getElementById(`version-${appNickname}`);

				let appVersion = await nonRpmVersion(appNickname);
				
				if (appVersion !== null) {
					versionElement.innerHTML = appVersion;
				} else {
					const rpmVer = rpmVersion(appNickname);
					
					if (rpmVer !== null) {
						versionElement.innerHTML = rpmVer;
					} else {
						console.log(`  ✗ Nenhuma versão encontrada para: ${appNickname}`);
					}
				}
			} else {
				console.log(`  ✗ Arquivo JSON NÃO encontrado para: ${appNickname}`);
			}
		}
	}

	console.log('Processo concluído!');
}

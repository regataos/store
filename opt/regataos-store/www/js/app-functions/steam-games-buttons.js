// Install and remove apps
setInterval(steamFunctionButtons, 500);
function steamFunctionButtons() {
	const exec = require('child_process').exec;
	const fs = require("fs");

	const captureIframe = document.getElementById("iframe-regataos-store").contentWindow;
	const captureIframeUrl = captureIframe.location.href;

	if ((captureIframeUrl.indexOf("app-") > -1) == "1") {
		const gameNickname = captureIframeUrl.split("app-")[1];

		if (fs.existsSync(`/opt/regataos-store/steam-list/${gameNickname}.json`)) {
			const data = fs.readFileSync(`/opt/regataos-store/steam-list/${gameNickname}.json`, "utf8");
			const game = JSON.parse(data);

			for (let i = 0; i < game.length; i++) {
				if ((game[i].nickname.indexOf(gameNickname) > -1) == "1") {
					if (fs.existsSync(`/tmp/regataos-store/config/steamapps/appmanifest_${game[i].rungameid}.acf`)) {
						captureIframe.document.getElementById(`steam-rungame-${game[i].nickname}`).style.display = "block";
						captureIframe.document.getElementById(`steam-${game[i].nickname}`).style.display = "none";

						captureIframe.document.getElementById(`steam-rungame-${game[i].nickname}`).onclick = function () {
							const commandLine = `steam steam://rungameid/${game[i].rungameid}`;
							exec(commandLine, (error, stdout, stderr) => {
							});
						};

					} else {
						captureIframe.document.getElementById(`steam-rungame-${game[i].nickname}`).style.display = "none";
						captureIframe.document.getElementById(`steam-${game[i].nickname}`).style.display = "block";

						captureIframe.document.getElementById(`steam-${game[i].nickname}`).onclick = function () {
							const commandLine = `steam steam://rungameid/${game[i].rungameid}`;
							exec(commandLine, (error, stdout, stderr) => {
							});
						};
					}
				}
			}

			const installed = fs.readFileSync("/opt/regataos-store/installed-apps/installed-apps.txt", "utf8");
			if ((installed.indexOf("steam") > -1) == "1") {
				captureIframe.document.getElementById("aviso-steam").style.display = "none";
			} else {
				captureIframe.document.getElementById("aviso-steam").style.display = "block";
			}
		}
	}
}

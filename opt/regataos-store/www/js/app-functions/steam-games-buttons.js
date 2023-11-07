// Install and remove apps
setInterval(steamFunctionButtons, 500);
function steamFunctionButtons() {
	const exec = require('child_process').exec;
	const fs = require("fs");

	const captureIframe = document.getElementById("iframe-regataos-store").contentWindow;
	const checkActionButtons = captureIframe.document.querySelectorAll(".game-button");

	if (checkActionButtons) {
		for (let i = 0; i < checkActionButtons.length; i++) {
			let gameNickname = checkActionButtons[i].id;

			if (!gameNickname.includes("steam-rungame")) {
				gameNickname = gameNickname.split("steam-")[1];

				if (fs.existsSync(`/opt/regataos-store/steam-list/${gameNickname}.json`)) {
					const data = fs.readFileSync(`/opt/regataos-store/steam-list/${gameNickname}.json`, "utf8");
					const game = JSON.parse(data);

					for (let i = 0; i < game.length; i++) {
						if (game[i].nickname.includes(gameNickname)) {
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
				}
			}
		}
	}

	// Warn that Steam needs to be installed
	const steamNotice = captureIframe.document.querySelector("#aviso-steam");
	if (steamNotice) {
		const installed = fs.readFileSync("/opt/regataos-store/installed-apps/installed-apps.txt", "utf8");
		if (installed.includes("steam")) {
			steamNotice.style.display = "none";
		} else {
			steamNotice.style.display = "block";
		}
	}
}

function installedPage() {
	const fs = require("fs");
	let jsonFiles = [];

	const captureIframeUrl = document.getElementById("iframe-regataos-store").contentWindow.location.href
	if (captureIframeUrl.includes("apps-installed2")) {
		fs.readdirSync("/opt/regataos-store/apps-list").forEach(jsonFiles => {
			fs.readFile(`/opt/regataos-store/apps-list/${jsonFiles}`, "utf8", function (err, data) {
				if (!err) {
					const apps = JSON.parse(data);
					const captureIframe = document.getElementById("iframe-regataos-store").contentWindow;
					const installed = fs.readFileSync("/opt/regataos-store/installed-apps/installed-apps.txt", "utf8");

					for (let i = 0; i < apps.length; i++) {
						const showStore = apps[i].show_store;
						const appNickname = apps[i].nickname
						const dad = captureIframe.document.querySelector(`div#all-apps-${apps[i].name.substr(0, 1).toLowerCase()}`);
						const child = dad.querySelector(`a#${apps[i].nickname}`);

						if (!showStore) {
							if (installed.includes(appNickname)) {
								if (child === null) {
									//Request the creation of the new element (block) for each app
									const newAppBlock = document.createElement("a");
									newAppBlock.id = apps[i].nickname;
									newAppBlock.setAttribute("href", `${setMainUrl()}/app-${apps[i].nickname}`);

									newAppBlock.innerHTML = ` \
									<div class="app" style="padding-top: 0px;"> \
										<div class="bloco"> \
										<img src="${apps[i].icon_backg}" title="${apps[i].name}" alt="${apps[i].name}" /> \
										</div> \
										<div class="cloco-texto"> \
											<p class="app-nome">${apps[i].name}</p> \
											<p class="display-price price-${apps[i].price}"></p> \
										</div> \
									</div>`;

									dad.appendChild(newAppBlock);
									const alphabet = `apps-${apps[i].name.substr(0, 1).toLowerCase()}`;
									captureIframe.document.getElementById(alphabet).style.display = "block";
								}
							}
						}
					}

					// Disable draggable
					const image = captureIframe.document.querySelectorAll("img");
					for (let i = 0; i < image.length; i++) {
						image[i].draggable = false;
					}

					const div = captureIframe.document.querySelectorAll("div");
					for (let i = 0; i < div.length; i++) {
						div[i].draggable = false;
					}

					const a = captureIframe.document.querySelectorAll("a");
					for (let i = 0; i < a.length; i++) {
						a[i].draggable = false;
					}

					return;
				}
			});
		});
	}
}

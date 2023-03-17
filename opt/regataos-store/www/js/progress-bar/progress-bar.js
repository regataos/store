// Get the app installation progress
setInterval(getAppInfo, 500);

function getAppInfo() {
	const fs = require('fs');

	// App name
	if (fs.existsSync("/tmp/progressbar-store/app-name")) {
		const appName = fs.readFileSync("/tmp/progressbar-store/app-name", "utf8");
		document.querySelector(".app-installing").innerHTML = appName;

	} else if (fs.existsSync("/tmp/progressbar-store/busy-installer-for.txt")) {
		const appName = fs.readFileSync("/tmp/progressbar-store/busy-installer-for.txt", "utf8");
		document.querySelector(".app-installing").innerHTML = appName;
	}

	// Installation progress
	if (fs.existsSync("/tmp/progressbar-store/progress")) {
		const percentage = fs.readFileSync("/tmp/progressbar-store/progress", "utf8");

		document.querySelector(".percentage").innerHTML = percentage;
		document.querySelector(".progress").style.width = percentage;
	}

	// Installation progress
	if (fs.existsSync("/tmp/progressbar-store/status")) {
		const status = fs.readFileSync("/tmp/progressbar-store/status", "utf8");

		document.querySelector(".status").innerHTML = status;
	}

	// App size
	if (fs.existsSync("/tmp/progressbar-store/file-size")) {
		const fileSize = fs.readFileSync("/tmp/progressbar-store/file-size", "utf8");

		document.getElementById("filesize").innerHTML = fileSize;
	}

	// Estimated download time
	if (fs.existsSync("/tmp/progressbar-store/eta")) {
		const downloadEta = fs.readFileSync("/tmp/progressbar-store/eta", "utf8");

		document.getElementById("eta").innerHTML = downloadEta;
	}

	// Download size
	if (fs.existsSync("/tmp/progressbar-store/runtime-download-size")) {
		const downloadSize = fs.readFileSync("/tmp/progressbar-store/runtime-download-size", "utf8");
		document.getElementById("downsize").innerHTML = downloadSize;

	} else if (fs.existsSync("/tmp/progressbar-store/download-size")) {
		const downloadSize = fs.readFileSync("/tmp/progressbar-store/download-size", "utf8");
		document.getElementById("downsize").innerHTML = downloadSize;
	}
}

// If necessary, display the moving bar or full bar
setInterval(progressBarMovement, 500);
function progressBarMovement() {
	const fs = require('fs');

	fs.access("/tmp/progressbar-store/progress-movement", (err) => {
		if (!err) {
			document.querySelector(".progress").style.display = "none";
			document.querySelector(".progress-full").style.display = "none";
			document.querySelector(".progress-movement").style.display = "block";
			document.querySelector(".percentage").style.display = "block";
			document.querySelector(".light-greyfull").style.display = "none";
			return;

		} else {
			fs.access("/tmp/progressbar-store/progress-full", (err) => {
				if (!err) {
					document.querySelector(".progress").style.display = "none";
					document.querySelector(".progress-movement").style.display = "none";
					document.querySelector(".progress-full").style.display = "block";
					document.querySelector(".percentage").style.display = "block";
					document.querySelector(".light-greyfull").style.display = "block";
					return;

				} else {
					document.querySelector(".progress-movement").style.display = "none";
					document.querySelector(".progress-full").style.display = "none";
					document.querySelector(".progress").style.display = "block";
					document.querySelector(".percentage").style.display = "block";
					document.querySelector(".light-greyfull").style.display = "block";
				}
			});
		}
	});

	// Show download speed
	const speedInfo = document.querySelectorAll(".dinfo");

	if (fs.existsSync("/tmp/progressbar-store/speed")) {
		for (let i = 0; i < speedInfo.length; i++) {
			speedInfo[i].classList.remove("install-off");
		}

	} else {
		for (let i = 0; i < speedInfo.length; i++) {
			speedInfo[i].classList.add("install-off");
		}
	}

	// Set width for status
	fs.access("/tmp/progressbar-store/progress", (err) => {
		if (!err) {
			const data = fs.readFileSync("/tmp/progressbar-store/progress", "utf8");
			const widthStatus = document.getElementById("status-download");

			if (data.length >= 2) {
				widthStatus.style.maxWidth = "160px";
			} else {
				widthStatus.style.maxWidth = "205px";
			}
		}
	});

	// Set icon for more info button
	fs.access("/tmp/progressbar-store/queued-1", (err) => {
		const iconMoreInfo = document.querySelector(".more-info");

		if (!err) {
			iconMoreInfo.style.backgroundImage = "url(./images/arrow-right-on.png)";
		} else {
			iconMoreInfo.style.backgroundImage = "url(./images/arrow-right-off.png)";
		}
	});
}

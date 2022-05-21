// If necessary, display the moving bar or full bar
setInterval(progressBarMovement, 500);

function progressBarMovement() {
	const fs = require('fs');
	var dir = "/tmp/progressbar-store/"

	fs.access(dir + 'progress-movement', (err) => {
		if (!err) {
			$(".progress-movement").css("display", "block")
			$(".progress").css("display", "none")
			$(".progress-full").css("display", "none")
			$(".percentage").css("display", "block")
			$(".light-greyfull").css("display", "none")
			$(".app-installingfull").css("margin-bottom", "5px")
			return;

		} else {
			fs.access(dir + 'progress-full', (err) => {
				if (!err) {
					$(".progress-full").css("display", "block")
					$(".percentage").css("display", "block")
					$(".progress-movement").css("display", "none")
					$(".progress").css("display", "none")
					$(".light-greyfull").css("display", "block")
					$(".app-installingfull").css("margin-bottom", "15px")
					return;

				} else {
					$(".progress-movement").css("display", "none")
					$(".progress-full").css("display", "none")
					$(".progress").css("display", "block")
					$(".percentage").css("display", "block")
					$(".light-greyfull").css("display", "block")
					$(".app-installingfull").css("margin-bottom", "15px")
				}
			});
		}
	});

	// Download speed
	if (fs.existsSync("/tmp/progressbar-store/speed")) {
		const linksPage = document.querySelectorAll(".dinfo");
		for (let i = 0; i < linksPage.length; i++) {
			linksPage[i].classList.remove("install-off");
		}

	} else {
		const linksPage = document.querySelectorAll(".dinfo");
		for (let i = 0; i < linksPage.length; i++) {
			linksPage[i].classList.add("install-off");
		}
	}
}

// Get the app installation progress
setInterval(getAppInfo, 500);

function getAppInfo() {
	const fs = require('fs');

	// App name
	if (fs.existsSync("/tmp/progressbar-store/app-name")) {
		const appName = fs.readFileSync("/tmp/progressbar-store/app-name", "utf8");

		document.querySelector(".app-installing").innerHTML = appName;
	}

	// Installation progress
	if (fs.existsSync("/tmp/progressbar-store/progress")) {
		const percentage = fs.readFileSync("/tmp/progressbar-store/progress", "utf8");

		document.querySelector(".percentage").innerHTML = percentage;
		document.querySelector(".progress").style.cssText = `width: ${percentage};`;
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
	if (fs.existsSync("/tmp/progressbar-store/download-size")) {
		const downloadSize = fs.readFileSync("/tmp/progressbar-store/download-size", "utf8");

		document.getElementById("downsize").innerHTML = downloadSize;
	}

	// Download speed
	if (fs.existsSync("/tmp/progressbar-store/speed")) {
		const speed = fs.readFileSync("/tmp/progressbar-store/speed", "utf8");

		document.querySelector(".down-speed2").innerHTML = speed;
	}
}

// Check process queue and sort by sequence
setInterval(checkQueue, 500);

function checkQueue() {
	const fs = require('fs');

	//queued1
	if (fs.existsSync("/tmp/progressbar-store/queued-1")) {
		document.querySelector(".queued-block").style.cssText = "display: block;";

		document.getElementById("queued-1").style.cssText = "display: block;";
		const queued1 = fs.readFileSync("/tmp/progressbar-store/queued-1", "utf8");
		document.querySelector("#queued-1 .queued-title").innerHTML = queued1;

	} else {
		document.querySelector(".queued-block").style.cssText = "display: none;";

		document.getElementById("queued-1").style.cssText = "display: none;";
	}

	//queued2
	if (fs.existsSync("/tmp/progressbar-store/queued-2")) {
		document.getElementById("queued-2").style.cssText = "display: block;";

		const queued2 = fs.readFileSync("/tmp/progressbar-store/queued-2", "utf8");
		document.querySelector("#queued-2 .queued-title").innerHTML = queued2;

	} else {
		document.getElementById("queued-2").style.cssText = "display: none;";
	}

	//queued3
	if (fs.existsSync("/tmp/progressbar-store/queued-3")) {
		document.getElementById("queued-3").style.cssText = "display: block;";

		const queued3 = fs.readFileSync("/tmp/progressbar-store/queued-3", "utf8");
		document.querySelector("#queued-3 .queued-title").innerHTML = queued3;

	} else {
		document.getElementById("queued-3").style.cssText = "display: none;";
	}

	//queued4
	if (fs.existsSync("/tmp/progressbar-store/queued-4")) {
		document.getElementById("queued-4").style.cssText = "display: block;";

		const queued4 = fs.readFileSync("/tmp/progressbar-store/queued-4", "utf8");
		document.querySelector("#queued-4 .queued-title").innerHTML = queued4;

	} else {
		document.getElementById("queued-4").style.cssText = "display: none;";
	}

	//queued5
	if (fs.existsSync("/tmp/progressbar-store/queued-5")) {
		document.getElementById("queued-5").style.cssText = "display: block;";

		const queued5 = fs.readFileSync("/tmp/progressbar-store/queued-5", "utf8");
		document.querySelector("#queued-5 .queued-title").innerHTML = queued5;

	} else {
		document.getElementById("queued-5").style.cssText = "display: none;";
	}

	//queued6
	if (fs.existsSync("/tmp/progressbar-store/queued-6")) {
		document.getElementById("queued-6").style.cssText = "display: block;";

		const queued6 = fs.readFileSync("/tmp/progressbar-store/queued-6", "utf8");
		document.querySelector("#queued-6 .queued-title").innerHTML = queued6;

	} else {
		document.getElementById("queued-6").style.cssText = "display: none;";
	}

	//queued7
	if (fs.existsSync("/tmp/progressbar-store/queued-7")) {
		document.getElementById("queued-7").style.cssText = "display: block;";

		const queued7 = fs.readFileSync("/tmp/progressbar-store/queued-7", "utf8");
		document.querySelector("#queued-7 .queued-title").innerHTML = queued7;

	} else {
		document.getElementById("queued-7").style.cssText = "display: none;";
	}

	//queued8
	if (fs.existsSync("/tmp/progressbar-store/queued-8")) {
		document.getElementById("queued-8").style.cssText = "display: block;";

		const queued8 = fs.readFileSync("/tmp/progressbar-store/queued-8", "utf8");
		document.querySelector("#queued-8 .queued-title").innerHTML = queued8;

	} else {
		document.getElementById("queued-8").style.cssText = "display: none;";
	}
}

const fs = require('fs');
const exec = require('child_process').exec;

// Show progress bar if process starts
function show_progressbarfull() {
fs.access('/tmp/progressbar-store/show-barfull', (err) => {
if (!err) {
	$(".progress-bar-full").css("display", "block")
	$(".progress-bar-full").css("margin-left", "250px")
	$(".progress-bar-full").css("opacity", "1")
	$(".li-sidebar-uninstalling a").css("border-left", "4px solid #0085e4")
	$(".li-sidebar-b a").css("border-left", "4px solid #0085e4")
	return;
} else {
	$(".progress-bar-full").css("margin-left", "240px")
	$(".progress-bar-full").css("opacity", "0.5")
	$(".li-sidebar-uninstalling a").css("border-left", "4px solid #2f3136")
	$(".li-sidebar-b a").css("border-left", "4px solid #2f3136")

	setTimeout(function() {
		$(".progress-bar-full").css("display", "none")
	}, 100);
}
});
}

// When prompted, display full progress bar
function showbarfull() {
	fs.writeFileSync("/tmp/progressbar-store/show-barfull", "show bar full");
}

function fullprogressbar() {
fs.access('/tmp/progressbar-store/show-barfull', (err) => {
if (!err) {
	$(".more-info").css("display", "block")
	$(".more-info2").css("display", "none")
	fs.unlinkSync("/tmp/progressbar-store/show-barfull");

	return;
} else {
	$(".progress-bar-full").css("display", "block")
	$(".more-info2").css("display", "block")
	$(".more-info").css("display", "none")
	showbarfull();
}
});
}

// Show progress bar if process starts
function show_progressbar_icon() {
fs.access('/tmp/progressbar-store/uninstalling', (err) => {
if (!err) {
	$(".li-sidebar-uninstalling").css("display", "block")
	$(".li-sidebar-b").css("display", "none")
	return;
} else {
	$(".li-sidebar-uninstalling").css("display", "none")
	$(".li-sidebar-b").css("display", "block")
}
});
}

function show_progressbar() {
fs.access('/tmp/progressbar-store/progressbar', (err) => {
if (!err) {
	$(".progress-bar").css("display", "block")
	$(".others").css("display", "none")
	show_progressbar_icon()
	show_progressbarfull()
	return;
} else {
	$(".progress-bar").css("display", "none")
	$(".li-sidebar-b").css("display", "none")
	$(".li-sidebar-uninstalling").css("display", "none")
	$(".progress-bar-full").css("display", "none")
	$(".others").css("display", "block")
	fs.unlinkSync("/tmp/progressbar-store/show-barfull");
}
});

fs.access('/tmp/progressbar-store/queued-3', (err) => {
if (!err) {
console.error('myfile already exists');
	$(".progress-bar-full").css("width", "435px")

	return;
} else {
	$(".progress-bar-full").css("width", "423px")
}
});
}

// If necessary, increase the size of the progress bar box
function downspeed() {
fs.access('/tmp/progressbar-store/speed', (err) => {
if (!err) {
	$("#iframepb").css("height", "205px")
	return;
} else {
	$("#iframepb").css("height", "180px")
}
});
}

// Check the system language information to set the store's primary url
function checklang() {
fs.access('/tmp/regataos-configs/config/plasma-localerc', (err) => {
if (!err) {
	fs.readFile('/tmp/regataos-configs/config/plasma-localerc', (err, data) => {
	if (err) throw err;
		var data = data

		if (data.indexOf("pt_BR") > -1) {
			window.linkstore = "https://newstore-regataos.blogspot.com/";
		} else if (data.indexOf("pt_PT") > -1) {
			window.linkstore = "https://newstore-regataos.blogspot.com/";
		} else if (data.indexOf("en_US") > -1) {
			window.linkstore = "https://en-newstore-regataos.blogspot.com/";
		} else {
			window.linkstore = "https://en-newstore-regataos.blogspot.com/";
		}
	});
	return;

} else {
	fs.readFile('/tmp/regataos-configs/config/user-dirs.locale', (err, data) => {
	if (err) throw err;
		var data = data

		if (data.indexOf("pt_BR") > -1) {
			window.linkstore = "https://newstore-regataos.blogspot.com/";
		} else if (data.indexOf("pt_PT") > -1) {
			window.linkstore = "https://newstore-regataos.blogspot.com/";
		} else if (data.indexOf("en_US") > -1) {
			window.linkstore = "https://en-newstore-regataos.blogspot.com/";
		} else {
			window.linkstore = "https://en-newstore-regataos.blogspot.com/";
		}
	});
}
});
}
checklang();

// Function back button
function voltar() {
	fs.access('/tmp/regataos-store/go-installed', (err) => {
	if (!err) {
		history.go(-2);
		return;
	} else {
		history.go(-1);
	}
	});
}

// Open the iframe with the app store homepage
function homestore() {
	fs.access('/usr/share/regataos/enterprise-iso.txt', (err) => {
	if (!err) {
		document.getElementById("iframeregata").contentWindow.document.location.href=linkstore + "p/enterprise.html";
	} else {
		document.getElementById("iframeregata").contentWindow.document.location.href=linkstore + "p/home.html";
	}
	});
}

// Display elements according to the main pages
function homeurl() {
	fs.access('/usr/share/regataos/enterprise-iso.txt', (err) => {
	if (!err) {
		var iframeregata = document.getElementById("iframeregata").contentWindow.location.href
		var homeurl = linkstore + "enterprise"
	
		if (iframeregata == homeurl) {
			$(".home a").css("border-left", "4px solid #0085e4")
			$("#iframeregata").css("position", "absolute")
			$(".topbar").css("display", "none")
	
		} else {
			$(".home a").css("border-left", "4px solid #333334")
		}

	} else {
		var iframeregata = document.getElementById("iframeregata").contentWindow.location.href
		var homeurl = linkstore + "home"
	
		if (iframeregata == homeurl) {
			$(".home a").css("border-left", "4px solid #0085e4")
			$("#iframeregata").css("position", "absolute")
			$(".topbar").css("display", "none")
	
		} else {
			$(".home a").css("border-left", "4px solid #333334")
		}
	}
	});
}

// Show or hide specific elements, depending on the URL visited, and perform other tasks
// Check internet connection for topbar
function check_network_topbar() {
	fs.readFile('/tmp/apps-scripts/network-status.txt', (err, data) => {
	if (err) throw err;
	var data = data
	if ((data.indexOf("online") > -1) == "1") {
		var iframeregata = document.getElementById("iframeregata").contentWindow.location.href
		if ((iframeregata.indexOf("home") > -1) == "1") {
			$(document).ready(function() {
			$(".topbar").css("display", "none")
			});
		}
	} else if ((data.indexOf("offline") > -1) == "1") {
		$(document).ready(function() {
		$(".topbar").css("display", "none")
		});
	}

	});
}
check_network_topbar()

function iframeurl() {
	//Show or hide specific elements, depending on the URL visited
	var iframeregata = document.getElementById("iframeregata").contentWindow.location.href

	fs.access('/usr/share/regataos/enterprise-iso.txt', (err) => {
	if (!err) {
		if ((iframeregata.indexOf("enterprise") > -1) == "1") {
			$(".topbar").css("display", "none")
		}
	} else {
		if ((iframeregata.indexOf("home") > -1) == "1") {
			$(".topbar").css("display", "none")
		}
	}
	});

	if ((iframeregata.indexOf("create") > -1) == "1") {
		$(".topbar").css("display", "none")
		$(".create a").css("border-left", "4px solid #0085e4")
	} else {
		$(".create a").css("border-left", "4px solid #333334")
	}

	if ((iframeregata.indexOf("work") > -1) == "1") {
		$(".topbar").css("display", "none")
		$(".work a").css("border-left", "4px solid #0085e4")
	} else {
		$(".work a").css("border-left", "4px solid #333334")
	}

	if ((iframeregata.indexOf("game") > -1) == "1") {
		$(".topbar").css("display", "none")
		$(".game a").css("border-left", "4px solid #0085e4")
	} else {
		$(".game a").css("border-left", "4px solid #333334")
	}

	if ((iframeregata.indexOf("develop") > -1) == "1") {
		$(".topbar").css("display", "none")
		$(".develop a").css("border-left", "4px solid #0085e4")
	} else {
		$(".develop a").css("border-left", "4px solid #333334")
	}

	if ((iframeregata.indexOf("utilities") > -1) == "1") {
		$(".topbar").css("display", "none")
		$(".utilities a").css("border-left", "4px solid #0085e4")
	} else {
		$(".utilities a").css("border-left", "4px solid #333334")
	}

	if ((iframeregata.indexOf("category") > -1) == "1") {
		$(".topbar").css("display", "none")
		$(".category a").css("border-left", "4px solid #0085e4")
	} else {
		$(".category a").css("border-left", "4px solid #333334")
	}

	if ((iframeregata.indexOf("apps-installed2") > -1) == "1") {
		$(".topbar").css("display", "none")
		$(".installed a").css("border-left", "4px solid #0085e4")
	} else if ((iframeregata.indexOf("app-") > -1) == "1") {
		$(".topbar").css("display", "flex")
		$(".installed a").css("border-left", "4px solid #333334")
	} else if ((iframeregata.indexOf("search?q=") > -1) == "1") {
		$(".installed a").css("border-left", "4px solid #333334")
		$(".topbar").css("display", "flex")
	} else {
		$(".installed a").css("border-left", "4px solid #333334")
	}
}

// Functions to navigate between pages
//Go for pages
function go_home() {
	fs.access('/usr/share/regataos/enterprise-iso.txt', (err) => {
		if (!err) {
			document.getElementById("iframeregata").contentWindow.document.location.href=linkstore + "p/enterprise.html";
		} else {
			document.getElementById("iframeregata").contentWindow.document.location.href=linkstore + "p/home.html";
		}
	});
	fs.unlinkSync("/tmp/regataos-store/go-installed");
}

function go_create() {
	document.getElementById("iframeregata").contentWindow.document.location.href=linkstore + "p/create.html";
	fs.unlinkSync("/tmp/regataos-store/go-installed");
}

function go_work() {
	document.getElementById("iframeregata").contentWindow.document.location.href=linkstore + "p/work.html";
	fs.unlinkSync("/tmp/regataos-store/go-installed");
}

function go_game() {
	document.getElementById("iframeregata").contentWindow.document.location.href=linkstore + "p/game.html";
	fs.unlinkSync("/tmp/regataos-store/go-installed");
}

function go_develop() {
	document.getElementById("iframeregata").contentWindow.document.location.href=linkstore + "p/develop.html";
	fs.unlinkSync("/tmp/regataos-store/go-installed");
}

function go_utilities() {
	document.getElementById("iframeregata").contentWindow.document.location.href=linkstore + "p/utilities.html";
	fs.unlinkSync("/tmp/regataos-store/go-installed");
}

function go_category() {
	document.getElementById("iframeregata").contentWindow.document.location.href=linkstore + "p/category.html";
	fs.unlinkSync("/tmp/regataos-store/go-installed");
}

function go_installed() {
	document.getElementById("iframeregata").contentWindow.document.location.href=linkstore + "p/apps-installed2.html";
	fs.writeFileSync("/tmp/regataos-store/go-installed", "go installed");
}

// For Enterprise
function for_enterprise() {
fs.access('/usr/share/regataos/enterprise-iso.txt', (err) => {
if (!err) {
	$("li.game").css("display", "none")
} else {
	$("li.game").css("display", "block")
}
});
}

// Prepare to return to the "Installed" page.
function go_install() {
	var capture_iframe_url = document.getElementById("iframeregata").contentWindow.location.href

	if ((capture_iframe_url.indexOf("apps-installed2") > -1) == "1") {
		if (!fs.existsSync("/tmp/regataos-store/go-installed")) {
			fs.writeFileSync("/tmp/regataos-store/go-installed", "go installed");
		}

	} else if ((capture_iframe_url.indexOf("app-") > -1) == "0") {
		if (fs.existsSync("/tmp/regataos-store/go-installed")) {
			fs.unlinkSync("/tmp/regataos-store/go-installed");
		}
	}
}

setInterval(function() {
	go_install();
}, 500);

setInterval(function() {
	for_enterprise();
	show_progressbar();
	downspeed();
	homeurl();
	iframeurl();
}, 100);

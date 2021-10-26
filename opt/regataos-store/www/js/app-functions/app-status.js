// Checking if apps are being installed or removed
function status() {
const fs = require('fs');

// Capture iframe and check the url of the app page
var capture_iframe_url = document.getElementById("iframeregata").contentWindow.location.href
var appname = capture_iframe_url.split("app-")[1];
// appname = appname.replace(".html", "");

if ((capture_iframe_url.indexOf(appname) > -1) == "1") {
	// Show whether the application is being installed, removed or is still in the task queue
	fs.access("/tmp/progressbar-store/installing-" + appname, (err) => {
	if (!err) {
		// Capture iframe and check the url of the app page
		var capture_iframe = document.getElementById("iframeregata").contentWindow;
		var capture_iframe_url = document.getElementById("iframeregata").contentWindow.location.href
		var appname = capture_iframe_url.split("app-")[1];
		// appname = appname.replace(".html", "");

		capture_iframe.document.getElementById("install-"+appname).style.backgroundColor = "#e3e3e3";
		capture_iframe.document.getElementById("install-"+appname).style.borderRadius = "5px";
		capture_iframe.document.getElementById("install-"+appname).style.color = "#058a58";
		capture_iframe.document.getElementById("install-"+appname).style.pointerEvents = "none";
		capture_iframe.document.getElementById("install-"+appname).innerHTML=text_installing;

		capture_iframe.document.getElementById("open-"+appname).style.borderColor = "";
		capture_iframe.document.getElementById("open-"+appname).style.backgroundColor = "";
		capture_iframe.document.getElementById("open-"+appname).style.pointerEvents = "auto";
		return;

	} else {
		// Capture iframe and check the url of the app page
		var capture_iframe = document.getElementById("iframeregata").contentWindow;
		var capture_iframe_url = document.getElementById("iframeregata").contentWindow.location.href
		var appname = capture_iframe_url.split("app-")[1];
		// appname = appname.replace(".html", "");

		// Read the store's task list
		var checkqueue = fs.readFileSync("/tmp/progressbar-store/queued-process", "utf8");

		if ((checkqueue.indexOf(appname + "=install") > -1) == "1") {
			capture_iframe.document.getElementById("install-"+appname).style.backgroundColor = "#e3e3e3";
			capture_iframe.document.getElementById("install-"+appname).style.borderRadius = "5px";
			capture_iframe.document.getElementById("install-"+appname).style.color = "#058a58";
			capture_iframe.document.getElementById("install-"+appname).style.pointerEvents = "none";
			capture_iframe.document.getElementById("install-"+appname).innerHTML=text_in_queue;

		} else {
			capture_iframe.document.getElementById("install-"+appname).style.backgroundColor = "";
			capture_iframe.document.getElementById("install-"+appname).style.borderRadius = "5px";
			capture_iframe.document.getElementById("install-"+appname).style.color = "#ffffff";
			capture_iframe.document.getElementById("install-"+appname).style.pointerEvents = "auto";
			capture_iframe.document.getElementById("install-"+appname).innerHTML=text_install;
		}
	}
	});

	fs.access("/tmp/progressbar-store/uninstalling-" + appname, (err) => {
	if (!err) {
		// Capture iframe and check the url of the app page
		var capture_iframe = document.getElementById("iframeregata").contentWindow;
		var capture_iframe_url = document.getElementById("iframeregata").contentWindow.location.href
		var appname = capture_iframe_url.split("app-")[1];
		// appname = appname.replace(".html", "");

		capture_iframe.document.getElementById("remove-"+appname).style.backgroundColor = "#e3e3e3";
		capture_iframe.document.getElementById("remove-"+appname).style.borderRadius = "5px";
		capture_iframe.document.getElementById("remove-"+appname).style.color = "#bf2d32";
		capture_iframe.document.getElementById("remove-"+appname).style.pointerEvents = "none";
		capture_iframe.document.getElementById("remove-"+appname).innerHTML=text_uninstalling;

		capture_iframe.document.getElementById("open-"+appname).style.borderColor = "#808080";
		capture_iframe.document.getElementById("open-"+appname).style.backgroundColor = "#979797";
		capture_iframe.document.getElementById("open-"+appname).style.pointerEvents = "none";
		return;

	} else {
		// Capture iframe and check the url of the app page
		var capture_iframe = document.getElementById("iframeregata").contentWindow;
		var capture_iframe_url = document.getElementById("iframeregata").contentWindow.location.href
		var appname = capture_iframe_url.split("app-")[1];
		// appname = appname.replace(".html", "");

		// Read the store's task list
		var checkqueue = fs.readFileSync("/tmp/progressbar-store/queued-process", "utf8");

		if ((checkqueue.indexOf(appname + "=remove") > -1) == "1") {
			capture_iframe.document.getElementById("remove-"+appname).style.backgroundColor = "#e3e3e3";
			capture_iframe.document.getElementById("remove-"+appname).style.borderRadius = "5px";
			capture_iframe.document.getElementById("remove-"+appname).style.color = "#bf2d32";
			capture_iframe.document.getElementById("remove-"+appname).style.pointerEvents = "none";
			capture_iframe.document.getElementById("remove-"+appname).innerHTML=text_in_queue;

			capture_iframe.document.getElementById("open-"+appname).style.borderColor = "#808080";
			capture_iframe.document.getElementById("open-"+appname).style.backgroundColor = "#979797";
			capture_iframe.document.getElementById("open-"+appname).style.pointerEvents = "none";

		} else {
			capture_iframe.document.getElementById("remove-"+appname).style.backgroundColor = "";
			capture_iframe.document.getElementById("remove-"+appname).style.borderRadius = "5px";
			capture_iframe.document.getElementById("remove-"+appname).style.color = "#ffffff";
			capture_iframe.document.getElementById("remove-"+appname).style.pointerEvents = "auto";
			capture_iframe.document.getElementById("remove-"+appname).innerHTML=text_uninstall;

			capture_iframe.document.getElementById("open-"+appname).style.borderColor = "";
			capture_iframe.document.getElementById("open-"+appname).style.backgroundColor = "";
			capture_iframe.document.getElementById("open-"+appname).style.pointerEvents = "auto";
		}
	}
	});
}
}

setInterval(function() {
	status();
}, 1000);

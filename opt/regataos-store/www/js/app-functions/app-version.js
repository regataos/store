// Run the function according to the open app page
function version_rpm() {
const exec = require('child_process').exec;
const fs = require('fs');

	// Capture iframe and check the url of the app page
	var capture_iframe = document.getElementById("iframeregata").contentWindow;
	var capture_iframe_url = document.getElementById("iframeregata").contentWindow.location.href
	var appname = capture_iframe_url.split("app-")[1];
		// appname = appname.replace(".html", "");

	// Show app version
	if ((capture_iframe_url.indexOf(appname) > -1) == "1") {

		var files = [];

		var data = fs.readFileSync("/opt/regataos-store/apps-list/" + appname + ".json", "utf8");
		var apps = JSON.parse(data);

		for (var i = 0; i < apps.length; i++) {

			var text_content = capture_iframe.document.getElementById("version-" + appname).textContent;
			if ((text_content.indexOf("recent") > -1) == "1") {
				var command_line = "grep -r '" + apps[i].package + "' " + apps[i].repository_cache + " | awk '{print $2}' | cut -d'-' -f -1 | cut -d'g' -f -1 | sed s'/file//g' | sed '/^$/d' | tail -1";
				exec(command_line, (error, stdout, stderr) => {
				if (stdout) {
					if ((stdout.indexOf("nickname") > -1) == "0") {
						capture_iframe.document.getElementById("version-" + appname).innerHTML=stdout;
					}
				}
				});
			}
		}
	}
}

function version() {
const exec = require('child_process').exec;
const fs = require('fs');

	// Capture iframe and check the url of the app page
	var capture_iframe = document.getElementById("iframeregata").contentWindow;
	var capture_iframe_url = document.getElementById("iframeregata").contentWindow.location.href
	var appname = capture_iframe_url.split("app-")[1];
		// appname = appname.replace(".html", "");

	// Show app version
	if ((capture_iframe_url.indexOf(appname) > -1) == "1") {
		var text_content = capture_iframe.document.getElementById("version-" + appname).textContent;

		// Read the list of Snap app versions
		var snap_version_cache = fs.readFileSync("/tmp/regataos-store/config/snap-version-cache.txt", "utf8");
		if ((snap_version_cache.indexOf(appname) > -1) == "1") {
			if ((text_content.indexOf("recent") > -1) == "1") {
				var command_line = "grep -R '" + appname + "' /tmp/regataos-store/config/snap-version-cache.txt | awk '{print $2}'";
				exec(command_line, (error, stdout, stderr) => {
				if (stdout) {
					if ((stdout.indexOf("nickname") > -1) == "0") {
						capture_iframe.document.getElementById("version-" + appname).innerHTML=stdout;
					}
				}
				});
			}
		} else {
			version_rpm();
		}
	}
}

setInterval(function() {
	version();
}, 300);

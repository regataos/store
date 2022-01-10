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
		var package = apps[i].package
		var repository_cache = apps[i].repository_cache

		if ((repository_cache.indexOf("mainRepositoryName") > -1) == "1") {
			var main_repository_name = "grep -r mainRepositoryName= /usr/share/regataos/regataos-base-version.txt | cut -d'=' -f 2-";
			exec(main_repository_name, (error, stdout, stderr) => {
			if (stdout) {
				var repository_name = stdout
				var repository_name = repository_name.replace(/(\r\n|\n|\r)/gm, "");
				var text_content = capture_iframe.document.getElementById("version-" + appname).textContent;
				if ((text_content.indexOf("recent") > -1) == "1") {
					var command_line = "grep -r " + package + " /var/cache/zypp/solv/" + repository_name + " | awk '{print $2}' | cut -d'-' -f -1 | cut -d'g' -f -1 | sed s'/file//g' | sed '/^$/d' | tail -1";
					exec(command_line, (error, stdout, stderr) => {
					if (stdout) {
						var AppVersion = stdout
						if ((stdout.indexOf("nickname") > -1) == "0") {
							capture_iframe.document.getElementById("version-" + appname).innerHTML=AppVersion;
						}
					}
					});
				}
			}
			});

		} else if ((repository_cache.indexOf("basedOnVersion") > -1) == "1") {
			var repository_cache = repository_cache.replace(/(\[|\])/gm, "");
			var based_on_version = 'export basedOnVersion=$(grep -r "basedOnVersion=" "/usr/share/regataos/regataos-base-version.txt" | cut -d"=" -f 2-); echo ' + repository_cache + ' | sed "s,basedOnVersion,$basedOnVersion,"';
			exec(based_on_version, (error, stdout, stderr) => {

			if (stdout) {
				var repository_name = stdout
				var repository_name = repository_name.replace(/(\r\n|\n|\r)/gm, "");

				var text_content = capture_iframe.document.getElementById("version-" + appname).textContent;
				if ((text_content.indexOf("recent") > -1) == "1") {
					var command_line = "grep -r " + package + " " + repository_name + " | awk '{print $2}' | cut -d'-' -f -1 | cut -d'g' -f -1 | sed s'/file//g' | sed '/^$/d' | tail -1";
					exec(command_line, (error, stdout, stderr) => {
					if (stdout) {
						var AppVersion = stdout
						if ((stdout.indexOf("nickname") > -1) == "0") {
							capture_iframe.document.getElementById("version-" + appname).innerHTML=AppVersion;
						}
					}
					});
				}
			}
			});

		} else {
			var text_content = capture_iframe.document.getElementById("version-" + appname).textContent;
			if ((text_content.indexOf("recent") > -1) == "1") {
				var command_line = "grep -r '" + package + "' " + repository_cache + " | awk '{print $2}' | cut -d'-' -f -1 | cut -d'g' -f -1 | sed s'/file//g' | sed '/^$/d' | tail -1";
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
		var snap_version_cache = fs.readFileSync("/opt/regataos-store/installed-apps/snap-version-cache.txt", "utf8");
		if ((snap_version_cache.indexOf(appname) > -1) == "1") {
			if ((text_content.indexOf("recent") > -1) == "1") {
				var command_line = "grep -R '" + appname + "' /opt/regataos-store/installed-apps/snap-version-cache.txt | awk '{print $2}'";
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

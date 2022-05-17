// Install and remove apps
function info_functions() {
var fs = require("fs");

var files = [];

// Read JSON files with the list of apps
var data = fs.readFileSync("/opt/regataos-store/apps-list/" + appname + ".json", "utf8");
var apps = JSON.parse(data);

for (var i = 0; i < apps.length; i++) {
	if ((apps[i].nickname.indexOf(appname) > -1) == "1") {
		window.name = apps[i].name;
		window.nickname = apps[i].nickname;
		window.package = apps[i].package;
		window.package_prerm = apps[i].package_prerm;
		window.package_preinst = apps[i].package_preinst;
		window.extra_packages = apps[i].extra_packages;
		window.executable = apps[i].executable;
		window.architecture = apps[i].architecture;
		window.package_manager = apps[i].package_manager;
		window.repository_name = apps[i].repository_name;
		window.repository_url = apps[i].repository_url;
		window.download_link = apps[i].download_link;
	}
}
}

function functions_buttons() {
const exec = require('child_process').exec;
const fs = require('fs');

// Capture iframe
var capture_iframe = document.getElementById("iframe-regataos-store").contentWindow;
var capture_iframe_url = document.getElementById("iframe-regataos-store").contentWindow.location.href
var appname = capture_iframe_url.split("app-")[1];
	//appname = appname.replace(".html", "");

if ((capture_iframe_url.indexOf(appname) > -1) == "1") {
	// Check the list of installed apps
	var installed = fs.readFileSync("/opt/regataos-store/installed-apps/installed-apps.txt", "utf8");

	// Install and remove apps
	if ((installed.indexOf(appname) > -1) == "1") {
		//Show remove button
		window.appname = appname;
		remove_button();
		info_functions();

		//Remove app
		capture_iframe.document.getElementById("remove-" + appname).onclick = function() {
			var command_line = 'export name="' + name + '"; \
			export nickname="' + nickname + '"; \
			export package="' + package + '"; \
			export extra_packages="' + extra_packages + '"; \
			export architecture="' + architecture + '"; \
			export repository_name="' + repository_name + '";  \
			sudo -E /opt/regataos-store/removeapp/removeapp-' + package_manager + '; sudo /opt/regataos-prime/scripts/apps-hybrid-graphics';
			exec(command_line, (error, stdout, stderr) => {
				fs.writeFile('/var/log/regataos-logs/remove-app.log', stdout, (err) => {
				if (err) throw err;
				console.log('The file has been saved!');
				});
			});
		};

		//Open app
		capture_iframe.document.getElementById("open-" + appname).onclick = function() {
			var command_line = executable;
			exec(command_line, (error, stdout, stderr) => {
			});
		};
	} else {
		//Show install button
		window.appname = appname;
		install_button();
		info_functions();

		//Install app
		capture_iframe.document.getElementById("install-" + appname).onclick = function() {
			var command_line = 'export name="' + name + '"; \
			export nickname="' + nickname + '"; \
			export package="' + package + '"; \
			export package_prerm="' + package_prerm + '"; \
			export package_preinst="' + package_preinst + '"; \
			export extra_packages="' + extra_packages + '"; \
			export architecture="' + architecture + '"; \
			export repository_name="' + repository_name + '"; \
			export repository_url="' + repository_url + '"; \
			export download_link="' + download_link + '"; \
			sudo -E /opt/regataos-store/installapp/installapp-' + package_manager + '; sudo /opt/regataos-prime/scripts/apps-hybrid-graphics';
			exec(command_line, (error, stdout, stderr) => {
				fs.writeFile('/var/log/regataos-logs/install-app.log', stdout, (err) => {
				if (err) throw err;
				console.log('The file has been saved!');
				});
			});
		};
	}
}
}

setInterval(function() {
	functions_buttons();
}, 100);

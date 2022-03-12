function installed() {
var capture_iframe_url = document.getElementById("iframeregata").contentWindow.location.href
if ((capture_iframe_url.indexOf("apps-installed2") > -1) == "1") {

	const exec = require('child_process').exec;
	var fs = require("fs");

	var files = [];

	// Read JSON files with the list of apps
	fs.readdirSync("/opt/regataos-store/apps-list").forEach(files => {
	fs.readFile("/opt/regataos-store/apps-list/" +files , "utf8", function(err, data) {
	if(!err) {
	var apps = JSON.parse(data);

	var capture_iframe = document.getElementById("iframeregata").contentWindow;

		//Read the list of apps that should appear in each block
		for (var i = 0; i < apps.length; i++) {

		const show_store = apps[i].show_store;
		if (show_store == null) {

		var installed = fs.readFileSync("/opt/regataos-store/installed-apps/installed-apps.txt", "utf8");
		if (new RegExp('\\b' + apps[i].nickname + '\\b').test(installed)) {

		const dad = capture_iframe.document.querySelector("div#all-apps-" + apps[i].name.substr(0, 1).toLowerCase());
		const child = dad.querySelector("a#" + apps[i].nickname);
		if (child == null) {

			//Request the creation of the new element (block) for each app
			var new_app_blocks = document.createElement("a");
			new_app_blocks.id = apps[i].nickname;

			// Check the system language information to set the store's primary url
			if (fs.existsSync("/tmp/regataos-configs/config/plasma-localerc")) {
				var lang_data = fs.readFileSync("/tmp/regataos-configs/config/plasma-localerc", "utf8");
				if (lang_data.indexOf("pt_BR") > -1) {
					new_app_blocks.setAttribute("href", "https://newstore-regataos.blogspot.com/app-" + apps[i].nickname);
				} else if (lang_data.indexOf("pt_PT") > -1) {
					new_app_blocks.setAttribute("href", "https://newstore-regataos.blogspot.com/app-" + apps[i].nickname);
				} else if (lang_data.indexOf("en_US") > -1) {
					new_app_blocks.setAttribute("href", "https://en-newstore-regataos.blogspot.com/app-" + apps[i].nickname);
				} else {
					new_app_blocks.setAttribute("href", "https://en-newstore-regataos.blogspot.com/app-" + apps[i].nickname);
				}
			} else if (fs.existsSync("/tmp/regataos-configs/config/user-dirs.locale")) {
				var lang_data = fs.readFileSync("/tmp/regataos-configs/config/user-dirs.locale", "utf8");
				if (lang_data.indexOf("pt_BR") > -1) {
					new_app_blocks.setAttribute("href", "https://newstore-regataos.blogspot.com/app-" + apps[i].nickname);
				} else if (lang_data.indexOf("pt_PT") > -1) {
					new_app_blocks.setAttribute("href", "https://newstore-regataos.blogspot.com/app-" + apps[i].nickname);
				} else if (lang_data.indexOf("en_US") > -1) {
					new_app_blocks.setAttribute("href", "https://en-newstore-regataos.blogspot.com/app-" + apps[i].nickname);
				} else {
					new_app_blocks.setAttribute("href", "https://en-newstore-regataos.blogspot.com/app-" + apps[i].nickname);
				}
			} else {
				console.error('The system language information file does not exist.');
			}

			new_app_blocks.innerHTML = ' \
			<div class="app" style=" padding-top: 0px;"> \
				<div class="bloco"><img src="' + apps[i].icon_backg + '" title="' + apps[i].name + '" alt="' + apps[i].name + '" /> \
				</div> \
				<div class="cloco-texto"> \
					<p class="app-nome">' + apps[i].name + '</p> \
					<p class="display-price price-' + apps[i].price + '"></p> \
				</div> \
			</div>';

			var all_blocks = capture_iframe.document.querySelector("div#all-apps-" + apps[i].name.substr(0, 1).toLowerCase());
			all_blocks.appendChild(new_app_blocks);
			var alphabet = "apps-" + apps[i].name.substr(0, 1).toLowerCase();
			capture_iframe.document.getElementById(alphabet).style.display = "block";
		}
		}
		}
		}
	return;
	}
	});
	});
}
}

setInterval(function() {
	var capture_iframe_url = document.getElementById("iframeregata").contentWindow.location.href
	if ((capture_iframe_url.indexOf("apps-installed2") > -1) == "1") {
		installed()
	}
}, 500);

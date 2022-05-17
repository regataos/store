// Install and remove apps
function steam_info_functions() {
var fs = require("fs");

var files = [];

// Read JSON files with the list of apps
var data = fs.readFileSync("/opt/regataos-store/steam-list/" + nickname + ".json", "utf8");
var game = JSON.parse(data);

for (var i = 0; i < game.length; i++) {
	if ((game[i].nickname.indexOf(nickname) > -1) == "1") {
		window.rungameid = game[i].rungameid;
	}
}

// Make sure the Steam client is installed
var installed = fs.readFileSync("/opt/regataos-store/installed-apps/installed-apps.txt", "utf8");
if ((installed.indexOf("steam") > -1) == "1") {
	var capture_iframe = document.getElementById("iframe-regataos-store").contentWindow;
	capture_iframe.document.getElementById("aviso-steam").style.display = "none";
} else {
	var capture_iframe = document.getElementById("iframe-regataos-store").contentWindow;
	capture_iframe.document.getElementById("aviso-steam").style.display = "block";
}

}

function steam_functions_buttons() {
const exec = require('child_process').exec;
const fs = require('fs');

// Capture iframe
var capture_iframe = document.getElementById("iframe-regataos-store").contentWindow;
var capture_iframe_url = document.getElementById("iframe-regataos-store").contentWindow.location.href
var nickname = capture_iframe_url.split("app-")[1];

	if ((capture_iframe_url.indexOf(nickname) > -1) == "1") {

		window.nickname = nickname;
		steam_info_functions();

		fs.access("/tmp/regataos-store/config/steamapps/appmanifest_" + rungameid + ".acf", (err) => {
		if (!err) {
			// Run game
			capture_iframe.document.getElementById("steam-" + nickname).style.display = "none";
			capture_iframe.document.getElementById("steam-rungame-" + nickname).style.display = "block";
			capture_iframe.document.getElementById("steam-rungame-" + nickname).onclick = function() {
				var command_line = "steam steam://rungameid/" + rungameid;
				exec(command_line, (error, stdout, stderr) => {
				});
			};

		} else {
			// Install game
			capture_iframe.document.getElementById("steam-rungame-" + nickname).style.display = "none";
			capture_iframe.document.getElementById("steam-" + nickname).style.display = "block";
			capture_iframe.document.getElementById("steam-" + nickname).onclick = function() {
				var command_line = "steam steam://rungameid/" + rungameid;
				exec(command_line, (error, stdout, stderr) => {
				});
			};
		}
		});
	}
}

setInterval(function() {
	steam_functions_buttons();
}, 100);

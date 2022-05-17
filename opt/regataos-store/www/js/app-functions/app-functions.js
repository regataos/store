// Check the list of installed apps
function list_installed_app() {
	const fs = require('fs');
	fs.readFile("/opt/regataos-store/installed-apps/installed-apps.txt", (err, installed) => {
		if (err) throw err;
		window.installed = installed;
	});
}

// Install, remove or open app function
function run_command() {
	const exec = require('child_process').exec;
	var command_line = run_shellscript;
	exec(command_line, (error, stdout, stderr) => {
	});
}

// Show install button
function install_button() {
	var capture_iframe = document.getElementById("iframe-regataos-store").contentWindow;
	capture_iframe.document.getElementById("install-" + appname).style.display = "block";
	capture_iframe.document.getElementById("open-" + appname).style.display = "none";
	capture_iframe.document.getElementById("remove-" + appname).style.display = "none";
}

// Show remove button
function remove_button() {
	var capture_iframe = document.getElementById("iframe-regataos-store").contentWindow;
	capture_iframe.document.getElementById("install-" + appname).style.display = "none";
	capture_iframe.document.getElementById("open-" + appname).style.display = "block";
	capture_iframe.document.getElementById("remove-" + appname).style.display = "block";
}

// Hide buttons
function hide_button() {
	document.getElementsByClassName("actions").style.display = "none";
}

// Text translations
//Install
function text_install() {
	const exec = require('child_process').exec;
	var command_line = "cat /opt/regataos-store/www/js/translations/language/text-translations.txt | head -1 | tail -1";
	exec(command_line, (error, stdout, stderr) => {
		window.text_install = stdout;
	});
}
text_install()

//Installing
function text_installing() {
	const exec = require('child_process').exec;
	var command_line = "cat /opt/regataos-store/www/js/translations/language/text-translations.txt | head -2 | tail -1";
	exec(command_line, (error, stdout, stderr) => {
		window.text_installing = stdout;
	});
}
text_installing()

//Uninstall
function text_uninstall() {
	const exec = require('child_process').exec;
	var command_line = "cat /opt/regataos-store/www/js/translations/language/text-translations.txt | head -3 | tail -1";
	exec(command_line, (error, stdout, stderr) => {
		window.text_uninstall = stdout;
	});
}
text_uninstall()

//Uninstalling
function text_uninstalling() {
	const exec = require('child_process').exec;
	var command_line = "cat /opt/regataos-store/www/js/translations/language/text-translations.txt | head -4 | tail -1";
	exec(command_line, (error, stdout, stderr) => {
		window.text_uninstalling = stdout;
	});
}
text_uninstalling()

//In queue
function text_in_queue() {
	const exec = require('child_process').exec;
	var command_line = "cat /opt/regataos-store/www/js/translations/language/text-translations.txt | head -5 | tail -1";
	exec(command_line, (error, stdout, stderr) => {
		window.text_in_queue = stdout;
	});
}
text_in_queue()

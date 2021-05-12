// English language translation
$(document).ready(function() {
	// Top search
	$("#field").attr({value:"Search"});
	$("#field").attr({onfocus:"if (this.value == 'Search') {this.value = '';}"});
	$("#field").attr({onblur:"if (this.value == '') {this.value = 'Search';}"});
	$(".topbar").attr({title:"Back to the previous page"});

	// Side bar
	//Home
	$(".home p").text("Discover");
	$(".home i").attr({title:"Discover"});
	//Create
	$(".create p").text("Create");
	$(".create i").attr({title:"Create"});
	//Work
	$(".work p").text("Work");
	$(".work i").attr({title:"Work"});
	//Play
	$(".game p").text("Play");
	$(".game i").attr({title:"Play"});
	//Develop
	$(".develop p").text("Develop");
	$(".develop i").attr({title:"Develop"});
	//Utilities
	$(".utilities p").text("Utilities");
	$(".utilities i").attr({title:"Utilities"});
	//Installed
	$(".installed p").text("Installed");
	$(".installed i").attr({title:"Installed"});
	//Installing
	$(".li-sidebar-b i").attr({title:"Installation in progress..."});

	// Check internet connection
	$(".networkoff-title").text("Unable to connect to the Internet");
	$(".networkoff-desc").html("Check the network, modem and router cables or<br/> connect to the Wi-Fi network again.");

});

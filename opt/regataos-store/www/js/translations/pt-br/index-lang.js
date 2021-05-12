// Portuguese language translation
$(document).ready(function() {
	// Top search and back button
	$("#field").attr({value:"Pesquisar"});
	$("#field").attr({onfocus:"if (this.value == 'Pesquisar') {this.value = '';}"});
	$("#field").attr({onblur:"if (this.value == '') {this.value = 'Pesquisar';}"});
	$(".topbar").attr({title:"Voltar"});

	// Side bar
	//Home
	$(".home p").text("Descobrir");
	$(".home i").attr({title:"Descobrir"});
	//Create
	$(".create p").text("Criar");
	$(".create i").attr({title:"Criar"});
	//Work
	$(".work p").text("Trabalhar");
	$(".work i").attr({title:"Trabalhar"});
	//Game
	$(".game p").text("Jogar");
	$(".game i").attr({title:"Jogar"});
	//Develop
	$(".develop p").text("Desenvolver");
	$(".develop i").attr({title:"Desenvolver"});
	//Utilities
	$(".utilities p").text("Utilidades");
	$(".utilities i").attr({title:"Utilidades"});
	//Installed
	$(".installed p").text("Instalados");
	$(".installed i").attr({title:"Instalados"});
	//Installing
	$("li-sidebar-b i").attr({title:"Instalação em andamento..."});

	// Check internet connection
	$(".networkoff-title").text("Não foi possível conectar-se à Internet");
	$(".networkoff-desc").html("Verifique os cabos de rede, modem e roteador ou<br/> conecte à rede Wi-Fi novamente.");
});

// Portuguese language translation

// Translation for app pages
setInterval(translateAppPage, 300);

function translateAppPage() {
	const captureIframe = document.getElementById("iframe-regataos-store").contentWindow;
	const pageUrl = captureIframe.location.href;

	if ((pageUrl.indexOf("app-") > -1) == "1") {
		const installButton = captureIframe.document.querySelector(".install-button");
		const installButtonExists = captureIframe.document.body.contains(installButton)
		if (installButtonExists) {
			installButton.innerHTML = "Instalar";
		}

		const InstallingButton = captureIframe.document.querySelector(".installing");
		const InstallingButtonExists = captureIframe.document.body.contains(InstallingButton)
		if (InstallingButtonExists) {
			InstallingButton.innerHTML = "Instalando...";
		}

		const removeButton = captureIframe.document.querySelector(".remove-button");
		const removeButtonExists = captureIframe.document.body.contains(removeButton)
		if (removeButtonExists) {
			removeButton.innerHTML = "Desinstalar";
		}

		const removingButton = captureIframe.document.querySelector(".removing");
		const removingButtonExists = captureIframe.document.body.contains(removingButton)
		if (removingButtonExists) {
			removingButton.innerHTML = "Desinstalando...";
		}

		const queueButton = captureIframe.document.querySelector(".remove-queue, .install-queue");
		const queueButtonExists = captureIframe.document.body.contains(queueButton)
		if (queueButtonExists) {
			queueButton.innerHTML = "Pendente...";
		}

		const openButton = captureIframe.document.querySelector(".open-button");
		const openButtonExists = captureIframe.document.body.contains(openButton)
		if (openButtonExists) {
			openButton.innerHTML = "Abrir";
		}
	}
}

// Translation for the desktop app
//Top search
document.querySelector("#field").value = "Pesquisar";
document.querySelector("#field").setAttribute("onfocus", "if (this.value == 'Pesquisar') {this.value = '';}");
document.querySelector("#field").setAttribute("onblur", "if (this.value == '') {this.value = 'Pesquisar';}");

//Top back button
document.querySelector(".topbar").title = "Voltar";

// Side bar
//Home
document.querySelector(".home p").innerHTML = "Descobrir";

//Create
document.querySelector(".create p").innerHTML = "Criar";

//Work
document.querySelector(".work p").innerHTML = "Trabalhar";

//Game
document.querySelector(".game p").innerHTML = "Jogar";

//Develop
document.querySelector(".develop p").innerHTML = "Desenvolver";

//Utilities
document.querySelector(".utilities p").innerHTML = "Utilidades";

//Installed
document.querySelector(".installed p").innerHTML = "Instalados";

//Installing
document.querySelector(".li-sidebar-b i").title = "Instalação em andamento...";

// Check internet connection
document.querySelector(".networkoff-title").innerHTML = "Não foi possível conectar-se à Internet";
document.querySelector(".networkoff-desc").innerHTML = "Verifique os cabos de rede, modem e roteador ou<br/> conecte à rede Wi-Fi novamente.";

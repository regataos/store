// Portuguese language translation

// Translation for progress bar
function translateProgressBar() {
	const downSpeed = document.querySelector(".down-speed-desc");
	const downSpeedExists = document.body.contains(downSpeed)
	if (downSpeedExists) {
		downSpeed.innerHTML = "Velocidade:";
	}

	const etaDesc = document.querySelector(".eta-desc");
	const etaDescExists = document.body.contains(etaDesc)
	if (etaDescExists) {
		etaDesc.innerHTML = "restante(s).";
	}

	const moreInfo = document.querySelector(".more-info");
	const moreInfoExists = document.body.contains(moreInfo)
	if (moreInfoExists) {
		moreInfo.title = "Mais informações";
	}

	const downPause = document.querySelector(".pause");
	const downPauseExists = document.body.contains(downPause)
	if (downPauseExists) {
		downPause.title = "Pausar o download";
	}

	const downPlay = document.querySelector(".play");
	const downPlayExists = document.body.contains(downPlay)
	if (downPlayExists) {
		downPlay.title = "Iniciar o download";
	}

	const downCancel = document.querySelector(".cancel");
	const downCancelExists = document.body.contains(downCancel)
	if (downCancelExists) {
		downCancel.title = "Cancelar";
	}

	const removeItem = document.querySelector(".close-button");
	const removeItemExists = document.body.contains(removeItem)
	if (removeItemExists) {
		removeItem.title = "Remover";
	}
}
translateProgressBar();

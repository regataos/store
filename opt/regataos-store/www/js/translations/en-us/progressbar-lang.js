// English language translation

// Translation for progress bar
function translateProgressBar() {
	const downSpeed = document.querySelector(".down-speed-desc");
	const downSpeedExists = document.body.contains(downSpeed)
	if (downSpeedExists) {
		downSpeed.innerHTML = "Speed:";
	}

	const etaDesc = document.querySelector(".eta-desc");
	const etaDescExists = document.body.contains(etaDesc)
	if (etaDescExists) {
		etaDesc.innerHTML = "remaining.";
	}

	const moreInfo = document.querySelector(".more-info");
	const moreInfoExists = document.body.contains(moreInfo)
	if (moreInfoExists) {
		moreInfo.title = "More information";
	}

	const downPause = document.querySelector(".pause");
	const downPauseExists = document.body.contains(downPause)
	if (downPauseExists) {
		downPause.title = "Pause download";
	}

	const downPlay = document.querySelector(".play");
	const downPlayExists = document.body.contains(downPlay)
	if (downPlayExists) {
		downPlay.title = "Start download";
	}

	const downCancel = document.querySelector(".cancel");
	const downCancelExists = document.body.contains(downCancel)
	if (downCancelExists) {
		downCancel.title = "Cancel";
	}

	const removeItem = document.querySelector(".close-button");
	const removeItemExists = document.body.contains(removeItem)
	if (removeItemExists) {
		removeItem.title = "Remove";
	}
}
translateProgressBar();

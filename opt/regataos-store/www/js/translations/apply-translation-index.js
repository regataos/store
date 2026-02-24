// Apply in-app translation based on user's language settings.

// Internal pages
setInterval(translateAppPage, 300);
function translateAppPage() {
    const checkIframe = document.getElementById("iframe-regataos-store");

    if (checkIframe) {
        const captureIframe = checkIframe.contentWindow;
        const checkActionButtons = captureIframe.document.querySelectorAll(".versionapp");

        if (checkActionButtons) {
            const fs = require('fs');

            const getTranslations = fs.readFileSync(selectTranslationFile(), "utf8");
            const translationData = JSON.parse(getTranslations);

            translationData.forEach((translations) => {

                const installButton = captureIframe.document.querySelectorAll(".install-button");
                for (let i = 0; i < installButton.length; i++) {
                    installButton[i].innerHTML = translations.storeAppPages.installButton;
                }

                const removeButton = captureIframe.document.querySelectorAll(".remove-button");
                for (let i = 0; i < removeButton.length; i++) {
                    removeButton[i].innerHTML = translations.storeAppPages.removeButton;
                }

                const gameButton = captureIframe.document.querySelectorAll(".game-button");
                for (let i = 0; i < gameButton.length; i++) {
                    gameButton[i].innerHTML = translations.storeAppPages.gameButton;
                }

                const openButton = captureIframe.document.querySelectorAll(".open-button");
                for (let i = 0; i < openButton.length; i++) {
                    openButton[i].innerHTML = translations.storeAppPages.openButton;
                }

                const InstallingButton = captureIframe.document.querySelectorAll(".installing");
                for (let i = 0; i < InstallingButton.length; i++) {
                    InstallingButton[i].innerHTML = translations.storeAppPages.InstallingButton;
                }

                const removingButton = captureIframe.document.querySelectorAll(".removing");
                for (let i = 0; i < removingButton.length; i++) {
                    removingButton[i].innerHTML = translations.storeAppPages.removingButton;
                }

                const queueButton = captureIframe.document.querySelector(".remove-queue, .install-queue");
                const queueButtonExists = captureIframe.document.body.contains(queueButton)
                if (queueButtonExists) {
                    queueButton.innerHTML = translations.storeAppPages.queueButton;
                }
            });
        }
    }
}

// Apply text translations in the app
function applyTranslation() {
    const fs = require('fs');

    let data = fs.readFileSync(selectTranslationFile(), "utf8");
    data = JSON.parse(data);

    for (let i = 0; i < data.length; i++) {
        // Search
        const searchBox = document.getElementById("field");
        searchBox.value = data[i].sidebar.search.defaultText;
        searchBox.setAttribute("onfocus", `if (this.value == '${data[i].sidebar.search.defaultText}') {this.value = '';}`);
        searchBox.setAttribute("onblur", `if (this.value == '') {this.value = '${data[i].sidebar.search.defaultText}';}`);

        // Side bar
        //Back button
        const backButton = document.querySelector(".topbar");
        backButton.title = data[i].sidebar.memu.backButton;

        //Menu
        const discover = document.querySelector(".home p");
        discover.innerHTML = data[i].sidebar.memu.discover;

        const create = document.querySelector(".create p");
        create.innerHTML = data[i].sidebar.memu.create;

        const work = document.querySelector(".work p");
        work.innerHTML = data[i].sidebar.memu.work;

        const play = document.querySelector(".game p");
        play.innerHTML = data[i].sidebar.memu.play;

        const develop = document.querySelector(".develop p");
        develop.innerHTML = data[i].sidebar.memu.develop;

        const utilities = document.querySelector(".utilities p");
        utilities.innerHTML = data[i].sidebar.memu.utilities;

        const installed = document.querySelector(".installed p");
        installed.innerHTML = data[i].sidebar.memu.installed;

        const installProgress = document.querySelector(".li-sidebar-b i");
        const installProgressExists = document.body.contains(installProgress)
        if (installProgressExists) {
            installProgress.title = data[i].sidebar.memu.installProgress;
        }

        // No internet access
        const networkOffTitle = document.querySelector(".networkoff-title");
        networkOffTitle.innerHTML = data[i].networkOff.title;

        const networkOffDesc = document.querySelector(".networkoff-desc");
        networkOffDesc.innerHTML = data[i].networkOff.description;

        // Translation for progress bar
        const downSpeed = document.querySelector(".down-speed-desc");
        const downSpeedExists = document.body.contains(downSpeed)
        if (downSpeedExists) {
            downSpeed.innerHTML = data[i].progressBar.downSpeed;
        }

        const etaDesc = document.querySelector(".eta-desc");
        const etaDescExists = document.body.contains(etaDesc)
        if (etaDescExists) {
            etaDesc.innerHTML = data[i].progressBar.etaDesc;
        }

        const moreInfo = document.querySelector(".more-info");
        const moreInfoExists = document.body.contains(moreInfo)
        if (moreInfoExists) {
            moreInfo.title = data[i].progressBar.moreInfo;
        }

        const downPause = document.querySelector(".pause");
        const downPauseExists = document.body.contains(downPause)
        if (downPauseExists) {
            downPause.title = data[i].progressBar.downPause;
        }

        const downPlay = document.querySelector(".play");
        const downPlayExists = document.body.contains(downPlay)
        if (downPlayExists) {
            downPlay.title = data[i].progressBar.downPlay;
        }

        const downCancel = document.querySelector(".cancel");
        const downCancelExists = document.body.contains(downCancel)
        if (downCancelExists) {
            downCancel.title = data[i].progressBar.downCancel;
        }

        const removeItem = document.querySelector(".close-button");
        const removeItemExists = document.body.contains(removeItem)
        if (removeItemExists) {
            removeItem.title = data[i].progressBar.removeItem;
        }
    }
}
applyTranslation();

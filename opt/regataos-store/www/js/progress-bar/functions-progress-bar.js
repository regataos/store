// Check process queue and sort by sequence
setInterval(checkQueue, 500);
function checkQueue() {
    const fs = require('fs');

    const queuedItem = document.querySelectorAll(".queued");

    for (let i = 0; i < queuedItem.length; i++) {
        const queuedItemId = queuedItem[i].id;
        const getqueuedItem = document.getElementById(queuedItemId);

        if (fs.existsSync(`/tmp/progressbar-store/${queuedItemId}`)) {
            getqueuedItem.style.cssText = "display: block;";

            const AppName = fs.readFileSync(`/tmp/progressbar-store/${queuedItemId}`, "utf8");
            document.querySelector(`#${queuedItemId} .queued-title`).innerHTML = AppName;

        } else {
            getqueuedItem.style.cssText = "display: none;";
        }

        if (fs.existsSync("/tmp/progressbar-store/queued-process")) {
            const data = fs.readFileSync("/tmp/progressbar-store/queued-process", "utf8");
            const queuedList = document.querySelector(".queued-block");

            if (data.length >= 2) {
                queuedList.style.cssText = "display: block;";
            } else {
                queuedList.style.cssText = "display: none;";
            }
        }
    }

    // Download speed
    if (fs.existsSync("/tmp/progressbar-store/speed")) {
        const speed = fs.readFileSync("/tmp/progressbar-store/speed", "utf8");

        document.querySelector(".down-speed2").innerHTML = speed;

        const dowFileSize = document.getElementById("download-file-size")
        const downFileSizeExists = document.body.contains(dowFileSize)
        if (downFileSizeExists) {
            dowFileSize.classList.remove("install-off");
        }
    } else {
        const dowFileSize = document.getElementById("download-file-size")
        const downFileSizeExists = document.body.contains(dowFileSize)
        if (downFileSizeExists) {
            dowFileSize.classList.add("install-off");
        }
    }
}

// Remove installations on process queue
function removeItemQueue(buttonId) {
    const appId = buttonId.replace(/queued-/g, "");

    const exec = require("child_process").exec;
    const commandLine = `sed -i ${appId}d /tmp/progressbar-store/queued-process`;
    exec(commandLine, function (error, call, errlog) {
    });
}

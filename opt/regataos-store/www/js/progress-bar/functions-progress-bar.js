(function () {
    "use strict";

    const _fs = (window.fs && typeof window.fs.readFileSync === "function")
        ? window.fs
        : require("fs");

    if (!window.fs) window.fs = _fs;

    const QUEUE_DIR = "/tmp/progressbar-store";
    const QUEUED_PROCESS_PATH = `${QUEUE_DIR}/queued-process`;
    const SPEED_PATH = `${QUEUE_DIR}/speed`;

    const _fileCache = new Map();
    function _readTextCached(path) {
        try {
            const st = _fs.statSync(path);
            const prev = _fileCache.get(path);
            if (prev && prev.mtimeMs === st.mtimeMs && prev.size === st.size) {
                return prev.text;
            }
            const text = _fs.readFileSync(path, "utf8");
            _fileCache.set(path, { mtimeMs: st.mtimeMs, size: st.size, text });
            return text;
        } catch (e) {
            _fileCache.delete(path);
            return null;
        }
    }

    const _queuedTitleCache = new Map();
    const _queuedVisibleCache = new Map();
    let _queuedListVisible = null;
    let _lastSpeedText = null;
    let _downloadFileSizeOff = null;

    function checkQueue() {

        const queuedProcessText = _readTextCached(QUEUED_PROCESS_PATH);
        const queuedList = document.querySelector(".queued-block");

        if (queuedList) {
            const shouldShowList = (queuedProcessText && queuedProcessText.length >= 2);
            if (shouldShowList !== _queuedListVisible) {
                _queuedListVisible = shouldShowList;
                queuedList.style.display = shouldShowList ? "block" : "none";
            }
        }

        const queuedItems = document.querySelectorAll(".queued");

        for (let i = 0; i < queuedItems.length; i++) {

            const queuedItemId = queuedItems[i].id;
            const itemEl = document.getElementById(queuedItemId);
            if (!itemEl) continue;

            const itemPath = `${QUEUE_DIR}/${queuedItemId}`;
            const titleText = _readTextCached(itemPath);

            const isVisible = (titleText !== null);
            const prevVisible = _queuedVisibleCache.get(queuedItemId);

            if (prevVisible !== isVisible) {
                _queuedVisibleCache.set(queuedItemId, isVisible);
                itemEl.style.display = isVisible ? "block" : "none";
            }

            if (isVisible) {
                const prevTitle = _queuedTitleCache.get(queuedItemId);
                if (prevTitle !== titleText) {
                    _queuedTitleCache.set(queuedItemId, titleText);
                    const titleEl = itemEl.querySelector(".queued-title");
                    if (titleEl) titleEl.textContent = titleText;
                }
            }
        }

        const speedText = _readTextCached(SPEED_PATH);

        const speedEl = document.querySelector(".down-speed2");
        if (speedEl) {
            if (speedText !== _lastSpeedText) {
                _lastSpeedText = speedText;
                speedEl.textContent = speedText || "";
            }
        }

        const dowFileSize = document.getElementById("download-file-size");
        if (dowFileSize) {
            const shouldBeOff = !speedText;
            if (shouldBeOff !== _downloadFileSizeOff) {
                _downloadFileSizeOff = shouldBeOff;
                if (shouldBeOff) dowFileSize.classList.add("install-off");
                else dowFileSize.classList.remove("install-off");
            }
        }
    }

    // Run once on startup
    checkQueue();

    // Watch directory instead of polling
    let debounceTimer = null;

    try {
        _fs.watch(QUEUE_DIR, () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(checkQueue, 100);
        });
    } catch (e) {
        // Fallback to polling only if watch fails
        setInterval(checkQueue, 1000);
    }

    // Remove installations on process queue
    window.removeItemQueue = function removeItemQueue(buttonId) {
        const appId = String(buttonId || "").replace(/queued-/g, "");
        if (!appId) return;

        const exec = require("child_process").exec;
        const commandLine = `sed -i '${appId}d' ${QUEUED_PROCESS_PATH}`;
        exec(commandLine, function () {});
    };

})();

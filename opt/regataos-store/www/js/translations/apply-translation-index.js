// apply-translation-index.js
// Event-driven translations for NW.js (no 300ms polling).
// - Caches the translation JSON (reloads only when file changes)
// - Translates main document + iframe document on load and DOM mutations (debounced)
//
// IMPORTANT (NW.js): do NOT declare a top-level identifier named `fs`.
// Some other scripts may already have `const fs = require("fs")` in the global scope.
// This file keeps Node imports inside an IIFE and uses local names to avoid collisions.

(function () {
    "use strict";

    // -----------------------------
    // Node modules (LOCAL ONLY)
    // -----------------------------
    let _fs = null;
    try { _fs = require("fs"); } catch (_) { _fs = null; }

    // -----------------------------
    // Translation cache
    // -----------------------------
    const _cache = { file: null, mtimeMs: 0, data: null };

    function _normalizeTranslation(parsed) {
        // Your translation files are an array with one object:
        // [ { ... } ]
        if (Array.isArray(parsed)) return parsed[0] || null;
        return parsed || null;
    }

    function getTranslation() {
        if (!_fs) return null;

        try {
            // This function is expected to exist in your app already.
            // It must return the full path to the JSON file (e.g. pt-br.json).
            const file = (typeof selectTranslationFile === "function") ? selectTranslationFile() : null;
            if (!file) return null;

            const st = _fs.statSync(file);
            if (_cache.file !== file || _cache.mtimeMs !== st.mtimeMs || !_cache.data) {
                const raw = _fs.readFileSync(file, "utf8");
                const parsed = _normalizeTranslation(JSON.parse(raw));
                _cache.file = file;
                _cache.mtimeMs = st.mtimeMs;
                _cache.data = parsed;
            }
            return _cache.data;
        } catch (_) {
            return null;
        }
    }

    // -----------------------------
    // Safe DOM helpers
    // -----------------------------
    function _setText(root, selector, text) {
        if (!root || text == null) return;
        const el = root.querySelector(selector);
        if (!el) return;
        const cur = (el.textContent || "").trim();
        if (cur !== String(text)) el.textContent = String(text);
    }

    function _setTextAll(root, selector, text) {
        if (!root || text == null) return;
        const els = root.querySelectorAll(selector);
        if (!els || !els.length) return;
        const s = String(text);
        for (let i = 0; i < els.length; i++) {
            const cur = (els[i].textContent || "").trim();
            if (cur !== s) els[i].textContent = s;
        }
    }

    function _setHTMLAll(root, selector, html) {
        // Keep innerHTML where your UI intentionally includes markup.
        if (!root || html == null) return;
        const els = root.querySelectorAll(selector);
        if (!els || !els.length) return;
        const s = String(html);
        for (let i = 0; i < els.length; i++) {
            if (els[i].innerHTML !== s) els[i].innerHTML = s;
        }
    }

    function _setAttr(root, selector, attr, value) {
        if (!root || value == null) return;
        const el = root.querySelector(selector);
        if (!el) return;
        const s = String(value);
        if (el.getAttribute(attr) !== s) el.setAttribute(attr, s);
    }

    // -----------------------------
    // Main document translation
    // -----------------------------
    function translateMainDocument(t) {
        if (!t) return;

        // Sidebar: labels (safe: only applies if elements exist)
        _setTextAll(document, ".create p", t.sidebar?.memu?.create);
        _setTextAll(document, ".work p",   t.sidebar?.memu?.work);
        _setTextAll(document, ".home p",   t.sidebar?.memu?.discover);
        _setTextAll(document, ".game p",   t.sidebar?.memu?.play);
        _setTextAll(document, ".develop p",    t.sidebar?.memu?.develop);
        _setTextAll(document, ".utilities p",  t.sidebar?.memu?.utilities);
        _setTextAll(document, ".installed p",  t.sidebar?.memu?.installed);

        // Back button label/title (depends on your markup; safe either way)
        _setTextAll(document, ".back-button p", t.sidebar?.memu?.backButton);
        _setAttr(document, ".back-button", "title", t.sidebar?.memu?.backButton);

        // Search placeholder / default text
        _setAttr(document, ".sidebar .search input", "placeholder", t.sidebar?.search?.defaultText);
        _setAttr(document, ".search input", "placeholder", t.sidebar?.search?.defaultText);

        // Network offline block
        _setText(document, ".network-off-title", t.networkOff?.title);
        _setHTMLAll(document, ".network-off-description", t.networkOff?.description);

        // Progress bar labels (safe)
        _setTextAll(document, ".down-speed-desc", t.progressBar?.downSpeed);
        _setTextAll(document, ".eta-desc", t.progressBar?.etaDesc);
        // "More info" should be a tooltip (title), not visible text
        _setAttr(document, ".more-info, div.more-info", "title", t.progressBar?.moreInfo);

        // Tooltips / titles (safe)
        _setAttr(document, ".down-pause", "title", t.progressBar?.downPause);
        _setAttr(document, ".down-play", "title", t.progressBar?.downPlay);
        _setAttr(document, ".down-cancel", "title", t.progressBar?.downCancel);
        _setAttr(document, ".close-button", "title", t.progressBar?.removeItem);
    }

    // -----------------------------
    // Iframe translation (store pages)
    // -----------------------------
    function _getStoreIframe() {
        // Your codebase uses both ids in different places.
        return (
            document.getElementById("iframe-regataos-store") ||
            document.getElementById("iframe-store")
        );
    }

    function translateIframeDocument(t) {
        const iframe = _getStoreIframe();
        if (!iframe) return;

        let doc = null;
        try { doc = iframe.contentDocument || iframe.contentWindow?.document; } catch (_) { doc = null; }
        if (!doc) return;

        // Buttons on app cards/pages
        _setHTMLAll(doc, ".install-button",   t.storeAppPages?.installButton);
        _setHTMLAll(doc, ".remove-button",    t.storeAppPages?.removeButton);
        _setHTMLAll(doc, ".game-button",      t.storeAppPages?.gameButton);
        _setHTMLAll(doc, ".open-button",      t.storeAppPages?.openButton);
        _setHTMLAll(doc, ".installing",       t.storeAppPages?.InstallingButton);
        _setHTMLAll(doc, ".removing",         t.storeAppPages?.removingButton);

        // Queue button (selector in your original file)
        const queueEl = doc.querySelector(".remove-queue, .install-queue");
        if (queueEl && t.storeAppPages?.queueButton != null && queueEl.innerHTML !== String(t.storeAppPages.queueButton)) {
            queueEl.innerHTML = String(t.storeAppPages.queueButton);
        }

        // Some pages may also include sidebar-like blocks inside the iframe
        _setTextAll(doc, ".create p", t.sidebar?.memu?.create);
        _setTextAll(doc, ".work p",   t.sidebar?.memu?.work);
        _setTextAll(doc, ".home p",   t.sidebar?.memu?.discover);
        _setTextAll(doc, ".game p",   t.sidebar?.memu?.play);
    }

    // -----------------------------
    // Public entrypoint
    // -----------------------------
    function applyTranslation() {
        const t = getTranslation();
        if (!t) return;
        translateMainDocument(t);
        translateIframeDocument(t);
    }

    // Expose for debugging/manual calls (won't collide with fs)
    try { window.applyTranslation = applyTranslation; } catch (_) {}

    // -----------------------------
    // Observers (debounced)
    // -----------------------------
    let _mainDebounce = null;
    function _scheduleMain() {
        clearTimeout(_mainDebounce);
        _mainDebounce = setTimeout(applyTranslation, 120);
    }

    function _setupMainObserver() {
        try {
            const obs = new MutationObserver(_scheduleMain);
            obs.observe(document.documentElement || document.body, { childList: true, subtree: true });
        } catch (_) {}
    }

    let _iframeObserver = null;
    let _iframeDebounce = null;
    function _scheduleIframe() {
        clearTimeout(_iframeDebounce);
        _iframeDebounce = setTimeout(applyTranslation, 150);
    }

    function _attachIframeHooks() {
        const iframe = _getStoreIframe();
        if (!iframe) return false;

        iframe.addEventListener("load", () => {
            _scheduleIframe();

            // Observe the iframe document for dynamic content
            try {
                if (_iframeObserver) _iframeObserver.disconnect();
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (!doc || !doc.documentElement) return;

                _iframeObserver = new MutationObserver(_scheduleIframe);
                _iframeObserver.observe(doc.documentElement, { childList: true, subtree: true, characterData: true });
            } catch (_) {}
        }, { passive: true });

        // initial best-effort
        _scheduleIframe();
        return true;
    }

    function _bootstrapIframe() {
        if (_attachIframeHooks()) return;
        // lightweight retry: iframe may be created after startup
        const timer = setInterval(() => {
            if (_attachIframeHooks()) clearInterval(timer);
        }, 1000);
    }

    // -----------------------------
    // Boot
    // -----------------------------
    document.addEventListener("DOMContentLoaded", () => {
        applyTranslation();
        _setupMainObserver();
        _bootstrapIframe();
    });
})();

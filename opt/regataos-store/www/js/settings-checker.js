// Check configuration files
function normalizeConfigString(configString) {
    configString = configString.toLowerCase();
    configString = configString.replace(/:.*/g, '');
    configString = configString.replace(/\.utf-8/g, "").replace(/\.utf8/g, "");
    configString = configString.replace(/_/g, '-');
    return configString;
}

function checkConfigFile(data, desiredString) {
    const searchString = new RegExp(`(?<=${desiredString}).*`, "g");
    const matchResult = data.match(searchString);

    if (matchResult) {
        const systemConfig = matchResult[0];
        return normalizeConfigString(systemConfig);
    } else {
        return "en-us";
    }
}

// Get the system language
function getSystemLanguage() {
    const fs = require('fs');
    let languageDetected = "";

    if (fs.existsSync("/tmp/regataos-configs/config/plasma-localerc")) {
        const checkLangSystem = fs.readFileSync("/tmp/regataos-configs/config/plasma-localerc", "utf8");
        const configOption = checkLangSystem.includes("LANGUAGE") ? "LANGUAGE=" : "LANG=";
        languageDetected = checkConfigFile(checkLangSystem, configOption);

    } else if (fs.existsSync("/tmp/regataos-configs/config/user-dirs.locale")) {
        const checkLangSystem = fs.readFileSync("/tmp/regataos-configs/config/user-dirs.locale", "utf8");
        languageDetected = checkLangSystem.toLowerCase().replace(/_/g, '-');
    }

    return languageDetected
}

// Choose the JSON file with the language translation.
function selectTranslationFile() {
    const translationDir = "/opt/regataos-store/www/js/translations/languages"

    if (fs.existsSync(`${translationDir}/${getSystemLanguage()}.json`)) {
        return `${translationDir}/${getSystemLanguage()}.json`;
    }
    return `${translationDir}/en-us.json`;

}

// Choose script language.
function selectTranslationScript() {
    const fs = require('fs');
    const translationDir = "/opt/regataos-store/scripts/translated-scripts"

    if (fs.existsSync(`${translationDir}/${getSystemLanguage()}`)) {
        return `${translationDir}/${getSystemLanguage()}`;
    }
    return `${translationDir}/en-us`;
}

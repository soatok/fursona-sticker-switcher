/** First, load prerequisites... **/
const remote = require('electron').remote;
const fs = require('fs');
const Settings = require('./settings');
const nodeConsole = require('console');
const html5 = require('html-entities').Html5Entities;
const path = require('path');
const { app, ipcRenderer: ipc } = require('electron');

/** Initialize some variables to be used throughout the lifetime of the app: */
window.$ = window.jQuery = require('jquery');
let myConsole = new nodeConsole.Console(process.stdout, process.stderr);

/**
 * Kickoff the sticker import process.
 *
 * @param {Event} e
 */
function importButtonPressed(e)
{
    let input = $("#sticker-url");
    let value = input.val().trim();
    let urlMatch = value.match(/^https:\/\/t.me\/addstickers\/([A-Za-z0-9_]{1,64})$/);
    if (urlMatch === null) {
        if (!value.match(/^[A-Za-z0-9_]{1,64}$/)) {
            input.addClass("error-input");
            return false;
        }
    } else {
        value = urlMatch[1];
    }
    input.removeClass("error-input");

    ipc.on('import-complete', function() {
        return remote.getCurrentWindow().close();
    });

    ipc.send('telegram-import',  {
        "sticker": value,
        "saveTo": Settings.load('./settings.json').get('telegramStickerDir')
    });
    $("#container").html("Downloading stickers...");
}

/**
 * Close the window.
 *
 * @param {Event} e
 */
function cancelButtonPressed(e)
{
    return remote.getCurrentWindow().close();
}

/**
 * Update the last active directory.
 */
function updateActiveDirectory()
{
    let config = Settings.load('./settings.json');
    let folder = document.getElementById("folder").files[0].path;
    config.set('telegramStickerDir', folder);
    $("#current-folder").html(html5.encode(folder));
    config.save();
}

$(document).ready(function() {
    let config = Settings.load('./settings.json');
    let lastDirectory = config.get('telegramStickerDir');

    if (typeof(lastDirectory) !== "string") {
        lastDirectory = path.join(app.getPath("home"), "Downloads", "Sticker Switcher");
        config.set('telegramStickerDir', lastDirectory);
        config.save();
    }
    if (!fs.existsSync(lastDirectory)) {
        fs.mkdir(lastDirectory);
    }

    if (lastDirectory.length > 0) {
        $("#current-folder").html(html5.encode(lastDirectory));
    }

    $("#folder").on('change', function(e) {
        updateActiveDirectory();
        $("#folder").val("");
    });

    $("#import-btn").on('click', importButtonPressed);
    $("#cancel-btn").on('click', cancelButtonPressed);
});

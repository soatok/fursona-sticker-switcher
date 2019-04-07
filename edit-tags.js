const ipc = require('electron').ipcRenderer;
// const nodeConsole = require('console');
const remote = require('electron').remote;

let images = [];
let activeId;
// let myConsole = new nodeConsole.Console(process.stdout, process.stderr);
window.$ = window.jQuery = require('jquery');

/**
 * Prevent apostrophes from being injected in URLs;
 *
 * @param {string} str
 * @returns {string}
 */
function escapeImagePath(str) {
    return str.split("'").join("%27");
}

/*
ONLOAD:
 1. Load the active sticker profile
 2. Load the image tags.
 3. Populate the editing UI.

ONSAVE:
 1. Send IPC to main to update sticker's tags.
 2. Close the window.
*/
function loadTags(id) {
    activeId = id;
    let activeImage = images[id];
    let tags = activeImage.tags || [];
    $("#sticker-preview").html(
        `<img ` +
            `data-path='${escapeImagePath(activeImage.path)}' ` +
            `src='file://${escapeImagePath(activeImage.path)}' ` +
        `/>`
    );
    $("#edit-tag").val(tags.join(', '));
}

function saveTags() {
    let tagsRaw = $("#edit-tag").val().split(',');
    let tags = [];
    let thisTag = '';
    for (let i = 0; i < tagsRaw.length; i++) {
        thisTag = tagsRaw[i].trim();
        if (thisTag.length > 0) {
            tags.push(thisTag);
        }
    }

    ipc.send('editTagComplete', {
        "path": images[activeId].path,
        "id": activeId,
        "tags": tags
    });
    return remote.getCurrentWindow().close();
}

$('document').ready(function() {
    $('#edit-tag-submit').on('click', function() {
        saveTags();
    });
    ipc.send("tagsWindowLoaded", true);
});
ipc.on('mainWindowArgs', function (event, data) {
    images = data.images;
    loadTags(data.id);
});


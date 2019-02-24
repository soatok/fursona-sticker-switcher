/** First, load prerequisites... **/
const { dialog } = require('electron').remote;
const changeTime = require('change-file-time');
const fs = require('fs');
const ipc = require('electron').ipcRenderer;
const nodeConsole = require('console');
const prompt = require('electron-prompt');
const Stickers = require('./stickers.js');

window.$ = window.jQuery = require('jquery');
let myConsole = new nodeConsole.Console(process.stdout, process.stderr);
let activeProfile;
let activeProfilePath;
let isWindowsAdmin = false;

/**
 * Append an image to the DOM.
 *
 * @param imageObject
 * @param index
 */
function appendImage(imageObject, index = 0) {
    try {
        $('#sticker-container').append(
            renderImagePreview(imageObject, index)
        );
        $('.sticker[data-index=' + index + ']').on('click', stickerOnClickEvent);
    } catch (e) {
        myConsole.log(e);
    }
}

/**
 * Prevent apostrophes from being injected in URLs;
 *
 * @param {string} str
 * @returns {string}
 */
function escapeImagePath(str) {
    return str.split("'").join("%27");
}

/**
 * Called by the main process when the user presses
 * File > New Profile
 */
function menuNewProfile() {
    activeProfile = Stickers.defaultProfile();
    activeProfilePath = "";
    $('#symlink-path').val(activeProfile.getSymlink());
    redrawImages();
}

/**
 * Called by the main process when the user presses
 * File > Load Profile
 */
function menuLoadProfile() {
    // Open a file dialog
    let file = dialog.showOpenDialog();
    if (typeof file === 'undefined') {
        return;
    }
    if (file.length < 1) {
        return;
    }

    // Load the profile from the given JSON file
    activeProfile = Stickers.loadFromProfile(file[0]);
    activeProfilePath = file[0];
    $('#symlink-path').val(activeProfile.getSymlink());
    redrawImages();
}


/**
 * Called by the main process when the user presses
 * File > Save Profile
 */
function menuSaveProfile() {
    // If path is unspecified, open a file dialog
    // Save the profile to the path specified
    if (activeProfile.getName() === "") {
        prompt({
            "name": "Profile Name?",
            "label": "Please enter a profile name:",
            "value": ""
        }).then(function (r) {
            try {
                activeProfile.setName(r);
                if (activeProfilePath === "") {
                    return menuSaveProfileAs();
                }
                return menuSaveFileCallback();
            } catch (e) {
                myConsole.log(e);
            }
        });
    } else {
        if (activeProfilePath === "") {
            return menuSaveProfileAs();
        }
        return menuSaveFileCallback();
    }
}

/**
 * Callback function for the Save Profile menu options.
 */
function menuSaveFileCallback() {
    return fs.writeFileSync(
        activeProfilePath,
        JSON.stringify({
            "version": activeProfile.getVersion(),
            "name": activeProfile.getName(),
            "symlink": activeProfile.getSymlink(),
            "images": activeProfile.getAllImages()
        })
    );
}


/**
 * Called by the main process when the user presses
 * File > Save Profile As
 */
function menuSaveProfileAs() {
    // Open a file dialog
    let oldValue = activeProfilePath;
    activeProfilePath = dialog.showSaveDialog();
    if (typeof activeProfilePath === "undefined") {
        activeProfilePath = oldValue;
        return;
    }
    if (activeProfilePath === "") {
        activeProfilePath = oldValue;
        return;
    }

    return menuSaveFileCallback();
    // Save the profile to the path specified
}


/**
 * Called by the main process when the user presses
 * File > Add Photo
 */
function menuAddPhoto() {
    // Open a file dialog
    let files = dialog.showOpenDialog({"properties": ['multiSelections']});
    if (typeof files === 'undefined') {
        return;
    }
    if (files.length < 1) {
        return;
    }

    // Append a photo
    for (let i = 0; i < files.length; i++) {
        let newImage = {"path": files[i]};
        activeProfile.appendImage(newImage);
        appendImage(newImage, i);
    }
    $('.sticker').on('click', stickerOnClickEvent);
}


/**
 * Clears and redraws all of the images in the active profile.
 */
function redrawImages() {
    // Iterate through activeProfile.getImages(), call appendImage()
    document.getElementById('sticker-container').innerHTML = "";

    for (let i = 0; i < activeProfile.getImageCount(); i++) {
        appendImage(activeProfile.getImage(i), i);
    }
    $('.sticker').on('click', stickerOnClickEvent);
}

/**
 * Return the HTML for rendering an image.
 *
 * @param {object} imageObject
 * @param {int} index
 * @returns {string}
 */
function renderImagePreview(imageObject, index = 0) {
    return "<div class=\"sticker\">" +
        "<img " +
            "alt='Click to choose sticker' " +
            "data-index='" + index + "' " +
            "data-path='" + escapeImagePath(imageObject.path) + "' " +
            "src='file://" + escapeImagePath(imageObject.path) + "' " +
        "/>" +
    "</div>";
}

/**
 * Select the image for display on stream.
 *
 * @param {string} activeImage
 */
function selectImage(activeImage) {
    try {
        // Change symlink to file
        if (fs.existsSync(activeProfile.getSymlink())) {
            fs.unlinkSync(activeProfile.getSymlink());
        }
        if (process.platform === "win32") {
            /*
             On Windows, if you don't have permission to create a symlink
             (i.e. you're not running this as Administrator), we have to
             delete and copy the file instead. This is much slower, but it
             serves the same purpose.
             */
            if (isWindowsAdmin) {
                let result = fs.symlinkSync(activeImage, activeProfile.getSymlink());
                changeTime(activeImage);
                return result;
            } else {
                // Do this asynchronously because it could be slower.
                return fs.copyFile(
                    activeImage,
                    activeProfile.getSymlink(),
                    function () {
                        changeTime(activeImage);
                    }
                );
            }
        } else {
            let result = fs.symlinkSync(activeImage, activeProfile.getSymlink());
            changeTime(activeImage);
            return result;
        }
    } catch (e) {
        myConsole.log(e);
    }
}

/**
 * Handle menu events from main.js and pass them to their relevant
 * functions.
 *
 * Uses a strict allow list to ensure main.js cannot call arbitrary functions.
 */
ipc.on('parentFunc', (event, data) => {
    switch (data) {
        case "menuNewProfile":
            return menuNewProfile();
        case "menuLoadProfile":
            return menuLoadProfile();
        case "menuSaveProfile":
            return menuSaveProfile();
        case "menuSaveProfileAs":
            return menuSaveProfileAs();
        case "menuAddPhoto":
            return menuAddPhoto();
        default:
            throw new Error("Function not allowed");
    }
});

/**
 * OnClick event handler for each sticker.
 */
function stickerOnClickEvent() {
    return selectImage($(this).find("img").data("path"));
}

/**
 * Startup functions
 */
menuNewProfile();
redrawImages();
if (process.platform === "win32") {
    let exec = require('child_process').exec;
    exec('NET SESSION', function (err, so, se) {
        isWindowsAdmin = se.length === 0;
    });
}
$("#symlink-path").on('change', function () {
    activeProfile.setSymlinkPath($(this).val());
});

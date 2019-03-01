/** First, load prerequisites... **/
const { dialog } = require('electron').remote;
const changeTime = require('change-file-time');
const fs = require('fs');
const ipc = require('electron').ipcRenderer;
const nodeConsole = require('console');
const prompt = require('electron-prompt');
const Settings = require('./settings');
const { Sortable } = require('@shopify/draggable');
const Stickers = require('./stickers.js');

window.$ = window.jQuery = require('jquery');
let myConsole = new nodeConsole.Console(process.stdout, process.stderr);
let activeProfile;
let activeProfilePath;
let dragFrom, dragOver;
let isWindowsAdmin = false;
/** @var {Settings} config */
let config;
let dragDrop;

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
 * Detect which sticker is the target of the symlink, mark it as active.
 *
 * Otherwise, mark the transparent space as active.
 */
function detectActiveSymlink() {
    let link = activeProfile.getSymlink();
    if (fs.existsSync(link)) {
        let realpath = fs.realpathSync(link);
        if (realpath.length > 0) {
            let len = activeProfile.getImageCount();
            let img;
            for (let i = 0; i < len; i++) {
                img = activeProfile.getImage(i);
                if (fs.realpathSync(img['path']) === realpath) {
                    $('.active').removeClass('active');
                    $('#image-' + i).addClass('active');
                    return;
                }
            }
        }
    }
    $('#transparent-sticker').addClass('active');
}

/**
 * @param {DragStartEvent} event
 */
function dragStartEvent(event) {
    let id = event.data.source.getAttribute('id');
    dragFrom = $("#"+id+" img").data('index');
}

/**
 * @param {DragOverEvent} event
 */
function dragOverEvent(event) {
    let id = event.over.getAttribute('id');
    let temp = $("#"+id+" img").data('index');
    if (temp !== dragFrom) {
        dragOver = temp;
    }
}

/**
 * @param {DragStopEvent} event
 */
function dragStopEvent(event) {
    if (dragOver < 0) {
        return;
    }
    // myConsole.log({"from": dragFrom, "to": dragOver});
    activeProfile.moveImage(dragFrom, dragOver);
    setTimeout(redrawImages, 1);
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
    $(document).attr('title', 'New Profile' + " - Fursona Sticker Switcher");
    $('#symlink-path').val(activeProfile.getSymlink());
    redrawImages();
    setTimeout(function() {
        $('.active').removeClass('active');
        $('#transparent-sticker').addClass('active');
    }, 1);
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
    if (file === null) {
        return;
    }
    if (file.length < 1) {
        return;
    }
    return loadProfile(file[0]);
}

/**
 * Actually load the file.
 *
 * @param {string} file
 */
function loadProfile(file) {

    // Load the profile from the given JSON file
    try {
        activeProfile = Stickers.loadFromProfile(file);
    } catch (e) {
        myConsole.log(e);
        throw e;
    }
    $(document).attr('title', activeProfile.getName() + " - Fursona Sticker Switcher");
    activeProfilePath = file;
    config.set("lastProfile", activeProfilePath);
    config.save();
    $('#symlink-path').val(activeProfile.getSymlink());
    redrawImages();
    setTimeout(detectActiveSymlink, 1);
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
                $(document).attr('title', r + " - Fursona Sticker Switcher");
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
    config.set("lastProfile", activeProfilePath);
    config.save();
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
    $('#sticker-container').html(
        renderTransparentImage()
    );

    for (let i = 0; i < activeProfile.getImageCount(); i++) {
        appendImage(activeProfile.getImage(i), i);
    }
    $('.sticker').on('click', stickerOnClickEvent);
}

function renderTransparentImage() {
    return "<div class=\"sticker\" id=\"transparent-sticker-container\">" +
        "<img " +
            "id='transparent-sticker' " +
            "class='transparent' " +
            "alt='Click to not choose a sticker' " +
            "data-index='-1' " +
            "data-path='' " +
            "src='transparent.png' " +
        "/>" +
    "</div>";
}

/**
 * Return the HTML for rendering an image.
 *
 * @param {object} imageObject
 * @param {int} index
 * @returns {string}
 */
function renderImagePreview(imageObject, index = 0) {
    return "<div class=\"sticker draggable-source\" id=\"image-" + index + "-container\">" +
        "<img " +
            "id='image-" + index + "' " +
            "title='image-" + index + "' " +
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
        if (activeImage === "") {
            return;
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
                changeTime(activeProfile.getSymlink());
                return result;
            } else {
                // Do this asynchronously because it could be slower.
                return fs.copyFile(
                    activeImage,
                    activeProfile.getSymlink(),
                    function () {
                        changeTime(activeImage);
                        changeTime(activeProfile.getSymlink());
                    }
                );
            }
        } else {
            let result = fs.symlinkSync(activeImage, activeProfile.getSymlink());
            changeTime(activeImage);
            changeTime(activeProfile.getSymlink());
            return result;
        }
    } catch (e) {
        myConsole.log(e);
    }
}

/**
 * OnClick event handler for each sticker.
 */
function stickerOnClickEvent() {
    $(".active").removeClass("active");
    $(this).addClass("active");
    return selectImage($(this).find("img").data("path"));
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
 * Startup functions
 */
$(document).ready(function() {
    config = Settings.load('./settings.json');
    try {
        loadProfile(config.get('lastProfile'));
    } catch (e) {
        myConsole.log(e);
        menuNewProfile();
    }
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
    dragDrop = new Sortable(
        document.getElementById('sticker-container')
    );
    dragDrop.on('drag:start', dragStartEvent);
    dragDrop.on('drag:over', dragOverEvent);
    dragDrop.on('drag:stop', dragStopEvent);
});

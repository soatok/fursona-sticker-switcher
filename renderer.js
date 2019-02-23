/** First, load prerequisites... **/
const { dialog } = require('electron').remote;
const fs = require('fs');
const ipc = require('electron').ipcRenderer;
const nodeConsole = require('console');
const prompt = require('electron-prompt');
const Stickers = require('./stickers.js');

window.$ = window.jQuery = require('jquery');

let myConsole = new nodeConsole.Console(process.stdout, process.stderr);
let activeProfile;
let activeProfilePath;

function appendImage(imageObject, index = 0) {
    // Draw an image, with a unique ID and common class.
    //
    // An onclick handler will be created to swap images out.
    try {
        $('#sticker-container').append(
            renderImagePreview(imageObject, index)
        );
        $('.sticker[data-index=' + index + ']').on('click', stickerOnClickEvent);
    } catch (e) {
        myConsole.log(e);
    }
}

function escapeImagePath(str) {
    return str.split("'").join("");
}

function menuNewProfile() {
    activeProfile = Stickers.defaultProfile();
    activeProfilePath = "";
    $('#symlink-path').val(activeProfile.getSymlink());
    redrawImages();
}

function menuLoadProfile() {
    // Open a file dialog
    let file = dialog.showOpenDialog();

    // Load the profile from the given JSON file
    activeProfile = Stickers.loadFromProfile(file[0]);
    activeProfilePath = file[0];
    $('#symlink-path').val(activeProfile.getSymlink());
    redrawImages();
}

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

function menuSaveProfileAs() {
    // Open a file dialog
    activeProfilePath = dialog.showSaveDialog();

    return menuSaveFileCallback();
    // Save the profile to the path specified
}
function menuAddPhoto() {
    // Open a file dialog
    let files = dialog.showOpenDialog({"properties": ['multiSelections']});

    // Append a photo
    for (let i = 0; i < files.length; i++) {
        let newImage = {"path": files[i]};
        activeProfile.appendImage(newImage);
        appendImage(newImage, i);
    }
    $('.sticker').on('click', stickerOnClickEvent);
}

function redrawImages() {
    // Iterate through activeProfile.getImages(), call appendImage()
    document.getElementById('sticker-container').innerHTML = "";

    for (let i = 0; i < activeProfile.getImageCount(); i++) {
        appendImage(activeProfile.getImage(i), i);
    }
    $('.sticker').on('click', stickerOnClickEvent);
}

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

function selectImage(activeImage) {

    try {
        // Change symlink to file
        if (fs.existsSync(activeProfile.getSymlink())) {
            fs.unlinkSync(activeProfile.getSymlink());
        }
        return fs.symlinkSync(activeImage, activeProfile.getSymlink());
    } catch (e) {
        myConsole.log(e);
    }
}

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

function stickerOnClickEvent() {
    return selectImage($(this).find("img").data("path"));
}

menuNewProfile();
redrawImages();

$("#symlink-path").on('change', function () {
    activeProfile.setSymlinkPath($(this).val());
});

/** First, load prerequisites... **/
const { dialog } = require('electron').remote;
const fs = require('fs');
const ipc = require('electron').ipcRenderer;
const nodeConsole = require('console');
const prompt = require('electron-prompt');
const Stickers = require('./stickers.js');

let myConsole = new nodeConsole.Console(process.stdout, process.stderr);
let activeProfile;
let activeProfilePath;

function menuNewProfile() {
    activeProfile = Stickers.defaultProfile();
    activeProfilePath = "";
    document.getElementById('symlink-path').value = activeProfile.getSymlink();
    redrawImages();
}

function menuLoadProfile() {
    // Open a file dialog
    let file = dialog.showOpenDialog();

    // Load the profile from the given JSON file
    activeProfile = Stickers.loadFromProfile(file[0]);
    activeProfilePath = file[0];
    document.getElementById('symlink-path').value = activeProfile.getSymlink();
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

    // Append a photo
}

function redrawImages() {
    // Iterate through activeProfile.getImages(), call appendImage()
    document.getElementById('sticker-container').innerHTML = "";
}

function appendImage(path = "") {
    // Draw an image, with a unique ID and common class.
    //
    // An onclick handler will be created to swap images out.
}

function selectImage(e) {
    // Take metadata from the selected image

    let activeImage = activeProfile.getImage(e.selected);

    // Change symlink to file
    fs.unlink(activeProfile.getSymlink());
    fs.symlink(activeProfile.getSymlink(), activeImage)
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

menuNewProfile();
redrawImages();
/** First, load prerequisites... **/
const fs = require('fs');
const ipc = require('electron').ipcRenderer;
// const nodeConsole = require('console');
const Stickers = require('./stickers.js');

// let myConsole = new nodeConsole.Console(process.stdout, process.stderr);
let activeProfile;

function menuNewProfile() {
    activeProfile = Stickers.defaultProfile();
    document.getElementById('symlink-path').value = activeProfile.getSymlink();
}

function menuLoadProfile() {
    // Open a file dialogue

    // Load the profile from the given JSON file
}

function menuSaveProfile() {
    // If path is unspecified, open a file dialogue
    // Save the profile to the path specified
}

function menuSaveProfileAs() {
    // Open a file dialogue

    // Save the profile to the path specified
}
function menuAddPhoto() {
    // Open a file dialogue

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

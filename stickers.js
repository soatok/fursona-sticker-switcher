const arrayMove = require('array-move');
const fs = require('fs');
const randomInt = require('./csprng.js');
const { app } = require('electron');
const path = require('path');
const fsp = require('fs').promises;

class Stickers
{
    constructor(data) {
        if (typeof(data) !== "object") {
            throw TypeError("An object was expected");
        }
        this.version = data.version || 1;
        this.name = data.name || "";
        this.symlink = data.symlink || "";
        this.images = data.images || [];
    }

    addImageFromPath(path) {
        this.appendImage({"path": path});
    }

    appendImage(imageObject) {
        this.images.push(imageObject);
    }

    /**
     * @param from {int}
     * @param to {int}
     */
    moveImage(from, to) {
        if (from === to) {
            return;
        }
        arrayMove.mut(this.images, from, to);
    }

    /**
     * Get the configuration for a given image.
     *
     * @param {int} index
     * @returns {object}
     */
    getImage(index) {
        return this.images[index];
    }

    /**
     * How many images are present in the current profile?
     *
     * @returns {number}
     */
    getImageCount() {
        return this.images.length;
    }

    /**
     * Returns an array of image objects.
     *
     * @returns {object[]}
     */
    getAllImages() {
        return this.images;
    }

    /**
     * Returns the name of the current sticker profile.
     *
     * @returns {string}
     */
    getName() {
        return this.name;
    }

    /**
     * Gets the file path of the current symlink.
     *
     * @returns {string}
     */
    getSymlink() {
        return this.symlink;
    }

    /**
     * Gets the current version for this profile.
     *
     * @returns {number}
     */
    getVersion() {
        return this.version;
    }

    removeSticker(index) {
        this.images.splice(index, 1);
    }

    /**
     * Sets the name of the current profile.
     *
     * @param {string} str
     */
    setName(str) {
        this.name = str;
    }

    /**
     * Sets the symlink path.
     *
     * @param {string} str
     */
    setSymlinkPath(str) {
        this.symlink = str;
    }

    /**
     * Load the default profile.
     *
     * @returns {Stickers}
     */
    static defaultProfile() {
        return new Stickers({
            "version": 1,
            "name": "",
            "symlink": path.join(app.getPath("home"), Stickers.randomFileName()),
            "images": []
        })
    }

    static async read(path) {
        return await fsp.readFile(path).then(data => {return data});
    }

    /**
     * Load a profile from the filesystem
     *
     * @param {string} path
     * @returns {Stickers}
     */
    static async loadFromProfile(path = "") {
        return new Stickers(
            JSON.parse(await Stickers.read(path))
        );

        return new Stickers(
            JSON.parse(
                fs.readFileSync(path).toString()
            )
        );
    }

    /**
     * Calculate a randomly-generated filename
     *
     * @param {number} len
     * @returns {string}
     */
    static randomFileName(len = 16) {
        let str = "";
        let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let charLen = 62;
        for (let i = 0; i < len; i++) {
            let r = randomInt(0, charLen - 1);
            str += chars.charAt(r);
        }
        return str;
    }
}

module.exports = Stickers;

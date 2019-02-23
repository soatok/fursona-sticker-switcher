const arrayMove = require('array-move');
const fs = require('fs');
const randomInt = require('./csprng.js');

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

    getImage(index) {
        return this.images[index];
    }

    getImageCount() {
        return this.images.length;
    }

    getAllImages() {
        return this.images;
    }

    getName() {
        return this.name;
    }

    getSymlink() {
        return this.symlink;
    }

    getVersion() {
        return this.version;
    }

    setName(str) {
        this.name = str;
    }
    setSymlinkPath(str) {
        this.symlink = str;
    }

    static defaultProfile() {
        return new Stickers({
            "version": 1,
            "name": "",
            "symlink": process.env.HOME + "/" + Stickers.randomFileName() + ".fur",
            "images": []
        })
    }

    static loadFromProfile(path = "") {
        return new Stickers(JSON.parse(fs.readFileSync(path).toString()));
    }

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

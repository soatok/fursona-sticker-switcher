const fs = require('fs');

class Settings
{
    constructor(data) {
        if (typeof (data) !== "object") {
            throw TypeError("An object was expected");
        }
        this.config = data;
    }

    set(key, value) {
        this.config[key] = value;
    }

    get(key) {
        if (typeof this.config[key] === "undefined") {
            return null;
        }
        return this.config[key];
    }

    save(path = "./settings.json") {
        return fs.writeFileSync(
            path,
            JSON.stringify(this.config)
        );
    }

    static load(path) {
        try {
            return new Settings(
                JSON.parse(fs.readFileSync(path).toString())
            );
        } catch (e) {
            return new Settings({
                "lastProfile": null,
                "telegramStickerDir": null
            });
        }
    }
}

module.exports = Settings;

// Modules to control application life and create native browser window
const {app, BrowserWindow, dialog, ipcMain, Menu, MenuItem} = require('electron');
const fs = require('fs');
const async = require('async');
const request = require('request');
const download = require('images-downloader').images;

const APP_CONFIG = {
    "STICKER_URL": "https://stickers.soatok.com"
};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let telegramImportWindow;
let haveUnsavedChanges;
let telegramWindowOpen = false;
let aboutWindow;
let aboutWindowOpen = false;
let telegramPending = 0;

function callFunctionInWindow(name) {
    return mainWindow.webContents.send('parentFunc', name);
}

function createIndexMenu() {
    const indexMenu = new Menu();
    const FileSubMenu = new Menu();
    const FileImportSubMenu = new Menu();
    const HelpSubMenu = new Menu();
    FileSubMenu.append(
        new MenuItem({
            "label": "New Profile",
            click() {
                if (telegramWindowOpen) {
                    telegramImportWindow.close();
                }
                return callFunctionInWindow('menuNewProfile');
            }
        })
    );
    FileSubMenu.append(
        new MenuItem({
            "label": "Load Profile",
            click() {
                if (telegramWindowOpen) {
                    telegramImportWindow.close();
                }
                return callFunctionInWindow('menuLoadProfile');
            }
        })
    );
    FileSubMenu.append(
        new MenuItem({
            "label": "Save Profile",
            click() {
                return callFunctionInWindow('menuSaveProfile');
            }
        })
    );
    FileSubMenu.append(
        new MenuItem({
            "label": "Save Profile As...",
            click() {
                return callFunctionInWindow('menuSaveProfileAs');
            }
        })
    );
    FileSubMenu.append(
        new MenuItem({
            "label": "Add Image",
            click() {
                return callFunctionInWindow('menuAddPhoto');
            }
        })
    );
    FileImportSubMenu.append(
        new MenuItem({
            "label": "Telegram",
            click() {
                return showTelegramImportWindow();
            }
        })
    );

    FileSubMenu.append(
        new MenuItem({
            "label": "Import",
            "submenu": FileImportSubMenu,
            click() {
                return callFunctionInWindow('menuAddPhoto');
            }
        })
    );


    HelpSubMenu.append(
        new MenuItem({
            "label": "About",
            click() {
                return showAboutWindow();
            }
        })
    );

    indexMenu.append(
        new MenuItem({
            "label": "File",
            "submenu": FileSubMenu
        })
    );
    indexMenu.append(
        new MenuItem({
            "label": "Help",
            "submenu": HelpSubMenu
        })
    );
    return indexMenu
}

/**
 * Import stickers from a Telegram sticker set.
 *
 * 1. Fetch the JSON for that sticker. Handle errors, etc.
 * 2. Iterate and download all stickers.
 * 3. Assemble an array of absolute file paths.
 * 4. Pass it along through IPC to main window.
 *
 * @param {object} arg
 */
function doTelegramImport(arg)
{
    let sticker = arg['sticker'];
    let saveTo = arg['saveTo'];

    request(
        `${APP_CONFIG["STICKER_URL"]}/pack/${sticker}`,
        function (err, resp, body) {
            if (typeof(resp.statusCode) === "undefined") {
                console.log("No status code defined");
                return;
            }
            if (resp.statusCode !== 200) {
                console.log("Error getting sticker pack metadata");
                return;
            }
            let parsed = JSON.parse(body);
            telegramPending = 0;
            // .forEachOf(obj, (value, key, callback) => {
            async.forEachOf(parsed.stickers, (sticker, key, callback) => {
                telegramPending++;
                downloadTelegramSticker(sticker.id, saveTo);
            });
        }
    );
}

/**
 * Download a Telegram sticker and save it to the destination directory.
 *
 * @param {string} stickerID
 * @param {string} saveDir
 */
function downloadTelegramSticker(stickerID, saveDir) {
    /* Don't download it if it's already local. */
    if (fs.existsSync(`${saveDir}/${stickerID}.png`)) {
        telegramPending--;
        if (telegramPending < 1) {
            mainWindow.webContents.send('import-complete', true);
            telegramImportWindow.webContents.send('import-complete', true);
        }
        return mainWindow.webContents.send(
            "telegram-imported-sticker",
            `${saveDir}/${stickerID}.png`
        );
    }
    /* Fetch it. */
    download(
        [`${APP_CONFIG["STICKER_URL"]}/sticker/${stickerID}.png`],
        saveDir
    ).then(result => {
        mainWindow.webContents.send(
            "telegram-imported-sticker",
            result[0].filename
        );
        telegramPending--;
        if (telegramPending < 1) {
            mainWindow.webContents.send('import-complete', true);
            telegramImportWindow.webContents.send('import-complete', true);
        }
    });
}

/**
 * Show Telegram import window if it's not already open.
 */
function showAboutWindow() {
    if (aboutWindowOpen) {
        return;
    }
    aboutWindow = new BrowserWindow({
        maxWidth: 1920,
        maxHeight: 1080,
        minWidth: 500,
        minHeight: 320,
        width: 500,
        height: 320
    });
    aboutWindow.setMenuBarVisibility(false);
    aboutWindow.setMenu(null);

    aboutWindow.loadFile('about.html');
    aboutWindow.on('closed', function() {
        aboutWindowOpen = false;
        aboutWindow = null;
    });
    aboutWindowOpen = true;
}
/**
 * Show Telegram import window if it's not already open.
 */
function showTelegramImportWindow() {
    if (telegramWindowOpen) {
        return;
    }
    telegramImportWindow = new BrowserWindow({
        maxWidth: 1920,
        maxHeight: 130,
        minWidth: 400,
        minHeight: 130,
        width: 400,
        height: 130
    });
    telegramImportWindow.setMenuBarVisibility(false);
    telegramImportWindow.setMenu(null);

    telegramImportWindow.loadFile('import-telegram.html');
    telegramImportWindow.on('closed', function() {
        telegramWindowOpen = false;
        telegramImportWindow = null;
    });
    telegramWindowOpen = true;
}

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        minWidth: 280,
        minHeight: 220,
        width: 810,
        height: 600
    });

    // and load the index.html of the app.
    mainWindow.loadFile('index.html');

    mainWindow.setMenu(createIndexMenu());
    // mainWindow.setMenuBarVisibility(false)

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // When the close button is pressed, or Alt+F4, etc.
    mainWindow.on('close', function (e) {
        if (haveUnsavedChanges) {
            let choice = dialog.showMessageBox(
                {
                    type: 'question',
                    buttons: ['Yes', 'No'],
                    title: 'Confirm',
                    message: 'You have unsaved changes. Are you sure you want to quit?'
                }
            );
            if (choice == 1) {
                e.preventDefault();
                return false;
            }
        }
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        if (telegramWindowOpen) {
            telegramImportWindow.close();
        }
    });

    ipcMain.on('telegram-import', (event, arg) => {
        doTelegramImport(arg);
    });

    ipcMain.on('unsaved-changes', (event, arg) => {
        haveUnsavedChanges = arg;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

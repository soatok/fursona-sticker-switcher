// Modules to control application life and create native browser window
const {app, BrowserWindow, dialog, ipcMain, Menu, MenuItem} = require('electron');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let haveUnsavedChanges;

function callFunctionInWindow(name) {
    return mainWindow.webContents.send('parentFunc', name);
}

function createIndexMenu() {
    const indexMenu = new Menu();
    const FileSubMenu = new Menu();
    FileSubMenu.append(
        new MenuItem({
            "label": "New Profile",
            click() {
                return callFunctionInWindow('menuNewProfile');
            }
        })
    );
    FileSubMenu.append(
        new MenuItem({
            "label": "Load Profile",
            click() {
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

    indexMenu.append(
        new MenuItem({
            "label": "File",
            "submenu": FileSubMenu
        })
    );
    return indexMenu
}

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
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
        mainWindow = null
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
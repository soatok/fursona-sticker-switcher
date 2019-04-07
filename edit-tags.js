const ipc = require('electron').ipcRenderer;
const nodeConsole = require('console');

let myConsole = new nodeConsole.Console(process.stdout, process.stderr);
window.$ = window.jQuery = require('jquery');

$('document').ready(function() {
    ipc.send("tagsWindowLoaded", true);
});
ipc.on('mainWindowArgs', function (event, args) {
    myConsole.log(args);
});


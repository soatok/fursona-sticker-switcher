/** First, load prerequisites... **/
const { remote } = require('electron');
const { Menu, MenuItem } = remote;
const { dialog } = require('electron').remote;
const changeTime = require('change-file-time');
const fs = require('fs');
const ipc = require('electron').ipcRenderer;
const nodeConsole = require('console');
const prompt = require('electron-prompt');
const Settings = require('./settings');
const { Sortable } = require('@shopify/draggable');
const Stickers = require('./stickers.js');

/** Initialize some variables to be used throughout the lifetime of the app: */
window.$ = window.jQuery = require('jquery');
let myConsole = new nodeConsole.Console(process.stdout, process.stderr);


const { shell } = require('electron');
window.$ = window.jQuery = require('jquery');
const remote = require('electron').remote;

/**
 * Close the window.
 *
 * @param {Event} e
 */
function okayButtonPressed(e)
{
    return remote.getCurrentWindow().close();
}

$(".hyperlink").on("click", function(e) {
    shell.openItem($(this).data('url'));
});
$("#okay-btn").on('click', okayButtonPressed);

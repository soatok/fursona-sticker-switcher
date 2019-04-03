const open = require('open');
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
    open($(this).data('url'), 'firefox');
});
$("#okay-btn").on('click', okayButtonPressed);

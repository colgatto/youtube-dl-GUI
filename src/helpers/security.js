import { remote, shell } from "electron";

window.eval = global.eval = function () {
    throw new Error(`Sorry, this app does not support window.eval().`);
}
remote.app.on('web-contents-created', (event, contents) => {
	contents.on('new-window', (event, navigationUrl) => {
	event.preventDefault();
	shell.openExternal(navigationUrl);
	});
});
import { app, BrowserWindow } from "electron";

export const optionMenuTemplate = {
	label: "Option",
	submenu: [{
		label: "Switch mode",
		accelerator: "Alt+CmdOrCtrl+S",
		click: () => {
			console.log('hei');
			/*
		
			*/
		}
	}
	]
};

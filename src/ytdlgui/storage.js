const fs = require('fs');
import { remote } from "electron";

let basePath = remote.app.getPath('userData');
let storagePath = basePath + '\\ytdlgui_data.json';

export const initStorage = () => {
	if(!fs.existsSync(storagePath))
		fs.writeFileSync(storagePath, '{}');
}

export const write = (obj) => {
	let st = JSON.parse(fs.readFileSync(storagePath));
	fs.writeFileSync(storagePath, JSON.stringify(Object.assign({}, st, obj)));
};

export const read = (key = null) => {
	let st = JSON.parse(fs.readFileSync(storagePath));
	return key == null ? st : st[key];
};
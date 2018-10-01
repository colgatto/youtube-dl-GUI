import "./stylesheets/roboto.css";
import "./stylesheets/main.css";
import "./stylesheets/bootstrap.min.css";
window.$ = window.jQuery = require('jquery');
window.Bootstrap = require('bootstrap');
import "./helpers/context_menu";
import "./helpers/external_links";
import "./helpers/security";
import * as gui from "./ytdlgui/gui";
import * as ytf from "./ytdlgui/ytdlfunz";
import * as storage from "./ytdlgui/storage";
import { isArray } from "util";
const fs = require('fs');
const ytdl = require('youtube-dl');
import { remote } from "electron";

document.querySelector("#app").innerHTML = gui.generateForm();

storage.initStorage();
let storageData = storage.read();
if(typeof storageData.downloadPath == "undefined"){
	storageData.downloadPath = remote.app.getPath('downloads');
	storage.write({
		downloadPath: storageData.downloadPath
	});
}

gui.renderDirectoryLabel(storageData.downloadPath);
fs.exists(storageData.downloadPath,(e) => {if(!e)fs.mkdir(storageData.downloadPath);});

document.querySelector('#directoryPicker').onchange = (e) => {
	storageData.downloadPath = e.target.files[0].path;
	gui.renderDirectoryLabel(storageData.downloadPath);
	storage.write({
		downloadPath: storageData.downloadPath
	});
};

document.querySelector("#scanButton").onclick = (e) => {
	var l = ytf.getAllIds();
	l.forEach((ids) => {
		gui.addDownloadRow('#downList tbody', ids.rowId);
	});
	ytf.getAllVideosInfo(l, 3);
};

document.querySelector("#allMp4Button").onclick = (e) => {
	var l = ytf.getAllIds();
	l.forEach((ids) => {
		gui.addDownloadRow('#downList tbody', ids.rowId);
	});
	ytf.getAllVideosInfo(l, 3, 'mp4');
};

document.querySelector("#allMp3Button").onclick = (e) => {
	var l = ytf.getAllIds();
	l.forEach((ids) => {
		gui.addDownloadRow('#downList tbody', ids.rowId);
	});
	ytf.getAllVideosInfo(l, 3, 'mp3');
};
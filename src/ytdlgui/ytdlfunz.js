import * as gui from "./gui";
import * as storage from "./storage";
import { isArray } from "util";
var path = require('path');
var fs = require('fs');
var ytdl = require('youtube-dl');
let spawn = require('child_process').spawn;

export const getAllIds = () => {
	return document.querySelector("#listUrl").value.split('\n').map((url) => {
		let v = validateUrl(url);
		return v ? { id: v, rowId: v + '_' + Math.round(Math.random() * 1000000) } : false;
	}).filter((ids) => {
		return ids;
	});
};

export const validateUrl = (url) => {
	const regex = /(?:youtube\.com(?:\/|%2F)(?:(?:watch|attribution_link)(?:\?|%3F)(?:(?:.+?(?:=|%3D).+?)(?:&|%3F))?v(?:=|%3D)|v(?:\/|%2F)|embed(?:\/|%2F))|youtu\.be(?:\/|%2F)|[a-zA-Z0-9]+\.ytimg\.com(?:\/|%2F)(?:yt(?:\/|%2F)favicon|vi(?:\/|%2F)))([-_a-zA-Z0-9]{11})/gmi;
	let m = regex.exec(url);
	return (isArray(m) && m.length > 1) ? m[1] : false;
}

export const downloadList = (l, multi = 1) => {
	let ids;
	if(multi <= 0) multi = 1;
	for(let i = 0; i < multi - 1; i++){
		if(l.length > 0){
			ids = l.shift();
			downloadVideo(ids);
		}
	}
	if(l.length > 0){
		ids = l.shift();
		downloadVideo(ids, () => {
			downloadList(l, multi);
		});
	}
};

export const getAllVideosInfo = (l, multi = 1, download = false) => {
	let ids;
	if(multi <= 0) multi = 1;
	for(let i = 0; i < multi - 1; i++){
		if(l.length > 0){
			ids = l.shift();
			getVideosInfo(ids, download);
		}
	}
	if(l.length > 0){
		ids = l.shift();
		getVideosInfo(ids, download, () => {
			getAllVideosInfo(l, multi, download);
		});
	}
}

export const getVideosInfo = (ids, download = false, callback = null) => {
	ytdl.getInfo('https://www.youtube.com/watch?v=' + ids.id, [], function(err, info) {
		if (err){
			gui.hideLoader(ids.rowId);
			gui.showError(ids, err);
			return;
		}
		ids.formats = info.formats.map((f) => {
			return {
				ext: f.ext,
				format: f.format.split(' - ')[1].split(' (')[0],
				format_note: f.format_note,
				url: f.url,
				format_id: f.format_id,
				filesize: typeof f.filesize !== "undefined" ? f.filesize : false,
				abr: f.abr
			}
		});
		gui.updateAfterInfo(ids, info.title, download, callback);
	});
};

export const downloadMp3 = (ids) => {
	/*
	let bestsAudio = ids.formats.filter((f) => {
		return f.format == "audio only"; 
	}).sort((a,b) => a.abr < b.abr);
	if(bestsAudio.length > 0){
	*/
	//TODO chose between best and fast
	gui.status(ids.rowId, 'Downloading');
	downloadVideo({
		id: ids.id,
		rowId: ids.rowId,
		formatId: 'best'
	}, (filePath) => {
		gui.resetMp3ProgressBar(ids.rowId);
		gui.status(ids.rowId, 'Converting');
		let newFilePath = filePath.slice(0, filePath.lastIndexOf('.') - 12) + '.mp3';
		let ff = spawn('ffmpeg', ['-y', '-i', filePath, newFilePath]);
		let duration, currentTime, percent;
		const durationRegex = /Duration: (\d*?):(\d{2}):(\d{2})\.(\d{0,2})/gm;
		const currentTimeRegex = /time=(\d*?):(\d{2}):(\d{2})\.(\d{0,2})/gm;
		let downloading = false;
		ff.stderr.on('data', (data) => {
			let strD = data.toString();
			if(!downloading){
				let d = durationRegex.exec(strD);
				if(isArray(d) && d.length > 4){
					duration = parseInt(d[4]) + parseInt(d[3], 10) * 100 + parseInt(d[2], 10) * 6000 + parseInt(d[1], 10) * 360000;
					downloading = true;
				}
			}else{
				let t = currentTimeRegex.exec(strD);
				if(isArray(t) && t.length > 4){
					currentTime = parseInt(t[4]) + parseInt(t[3], 10) * 100 + parseInt(t[2], 10) * 6000 + parseInt(t[1], 10) * 360000;
					percent = currentTime / duration * 100;
					gui.setMp3ProgressValue(ids.rowId, percent);
				}
			}
		});
		ff.on('exit', function (code) {
			gui.completeMp3ProgressBar(ids.rowId);
			gui.status(ids.rowId, 'Done!');
			fs.unlink(filePath);
		});
	}, true);
};

export const downloadVideo = (ids, callback = null, mp3 = false) => {
	gui.showLoader(ids.rowId);
	gui.resetProgressBar(ids.rowId);
	gui.status(ids.rowId, 'Downloading');
	let dowloadPath = gui.getDownloadPath();
	var url = 'https://www.youtube.com/watch?v=' + ids.id;
	var video = ytdl(url, mp3 ? [
		'--format=' + ids.formatId
	] : [
		'--format=' + ids.formatId,
		'--output=%(title)s.%(ext)s'
	], { cwd: __dirname });
	var size = 0;

	video.on('info', (info) => {
		var filePath = dowloadPath + '\\' + info._filename;
		video.pipe(fs.createWriteStream(filePath));
		gui.hideLoader(ids.rowId);
		size = info.size;
		var pos = 0;

		video.on('data', (chunk) => {
			pos += chunk.length;
			if (size){
				let percent = (pos / size * 100).toFixed(2);
				gui.setProgressValue(ids.rowId, percent);
			}
		});

		video.on('error', function error(err) {
			console.log('video error: ', err);
		});

		video.on('end', () => {
			if(!mp3){
				gui.completeProgressBar(ids.rowId);
				gui.status(ids.rowId, 'Done!');
				if(callback !== null) callback();
			}else{
				callback(filePath);
			}
		});
	});
};

export const playlistTest = () => {
	function playlist(url) {
		var video = ytdl(url);
		var size = 0;
		video.on('info', function (info) {
			size = info.size;
			var output = path.join(__dirname + '/', size + '.mp4');
			video.pipe(fs.createWriteStream(output));
		});
		var pos = 0;
		video.on('data', function data(chunk) {
			pos += chunk.length;
			// size should not be 0 here.
			if (size) {
				var percent = (pos / size * 100).toFixed(2);
				process.stdout.cursorTo(0);
				process.stdout.clearLine(1);
				process.stdout.write(percent + '%');
			}
		});
		video.on('next', playlist);
	}
	playlist('https://www.youtube.com/playlist?list=PLXKFVB1tpwKamMPr1_wsB6tMqyC6e3-an');
};
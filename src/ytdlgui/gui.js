import { downloadVideo, downloadMp3 } from "./ytdlfunz";

const downloadClick = (ids) => {
	downloadVideo(ids);
};

const mainDownloadClick = (ids) => {
	downloadMp3(ids);
};

const formatBytes = (a,b) => {if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]};


const makeDropdownFromFormats = (ids) => {
	return ids.formats.reverse().map((f) => {
		return '<a class="dropdown-item" href="#" data-video-id="' + ids.id + '" data-row-id="' + ids.rowId + '"  data-format-id="' + f.format_id + '" >' + f.ext + '\t' /*+ f.format*/ + '(' + f.format_note + ')' + (f.filesize ? '[' + formatBytes(f.filesize) + ']' : '') + '</a>';
	}).join('');
};

export const generateForm = () => {
	return '<div id="ytForm">'
		+ '	<legend class="ytguiTitle">YTD_GUI</legend>'
		+ '	<div class="form-row">'
		+ '		<div class="btn-group all-button-container" role="group">'
		+ '			<button id="allMp4Button" type="button" class="btn btn-secondary">All Mp4</button>'
		+ '			<button id="allMp3Button" type="button" class="btn btn-secondary">All Mp3</button>'
		+ '		</div>'
		+ '		<div class="scan-button-container"><button class="btn btn-secondary" id="scanButton" >Scan</button></div>'
		+ '		<div class="col-12">'
		+ '			<textarea class="form-control" id="listUrl" placeholder="Youtube Url List" rows="5"></textarea>'
		+ '		</div>'
		+ '	</div>'
		+ '	<div class="custom-file">Downloads directory: '
		+ '		<input type="file" class="custom-file-input" id="directoryPicker" webkitdirectory>'
		+ '		<label class="custom-file-label" id="directoryPickerLabel" for="directoryPicker">Choose file</label>'
		+ '	</div>'
		+ '</div>'
		+ '<div class="down-list-container">'
		+ '	<table id="downList">'
		+ '		<tbody>'
		+ '		</tbody>'
		+ '	</table>'
		+ '</div>';
};

const makeBaseRow = (rowId) => { 
	return '<tr id="download_field_' + rowId + '" class="download-field">'
		+ '	<td id="loader_' + rowId + '" class="loader">'
		+ '		<svg class="open" width="38px" height="8px" viewBox="0 0 38 8" fill="#2A9FD6">'
		+ '		<circle cx="4" cy="4" r="4"/>'
		+ '		<circle cx="19" cy="4" r="4"/>'
		+ '		<circle cx="34" cy="4" r="4"/>'
		+ '		</svg>'
		+ '	</td>'
		+ '	<td id="td_title_' + rowId + '" class="td-song-name"></td>'
		+ '	<td id="td_status_' + rowId + '" class="td-status">Getting Info</td>'
		+ '	<td class="td-button-right" rowspan="2">'
		+ '		<div class="btn-group float-right" role="group" aria-label="">'
		+ '			<button type="button" id="bt_main_' + rowId + '" class="btn btn-primary disabled">MP3</button>'
		+ '			<div class="btn-group" role="group">'
		+ '				<button id="bt_toggle_' + rowId + '" type="button" class="btn btn-primary dropdown-toggle disabled" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>'
		+ '				<div id="dropdown_download_' + rowId + '" class="dropdown-menu" aria-labelledby="bt_toggle_' + rowId + '" x-placement="bottom-start" style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(0px, 35px, 0px);">'
		+ '					<a class="dropdown-item" href="#">MP3</a>'
		+ '					<a class="dropdown-item" href="#">MKW</a>'
		+ '					<a class="dropdown-item" href="#">AVI</a>'
		+ '				</div>'
		+ '			</div>'
		+ '		</div>'
		+ '	</td>'
		+ '</tr>'
		+ '<tr class="progress-field">'
		+ '	<td class="td-progress-bar" colspan="3">'
		+ '		<div id="progress_bar_container_' + rowId + '" class="progress">'
		+ '			<div id="progress_bar_' + rowId + '" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>'
		+ '		</div>'
		+ '	</td>'
		+ '</tr>';
};

export const renderDirectoryLabel = (path) => {
	document.querySelector('#directoryPickerLabel').innerHTML = path;
};

export const addDownloadRow = (query, rowId) => {
	document.querySelector(query).innerHTML = makeBaseRow(rowId) + document.querySelector(query).innerHTML;
};

export const showLoader = (rowId) => {
	document.querySelector("#loader_" + rowId + " svg").classList.remove('close');
	document.querySelector("#loader_" + rowId + " svg").classList.add('open');
};

export const hideLoader = (rowId) => {
	document.querySelector("#loader_" + rowId + " svg").classList.remove('open');
	document.querySelector("#loader_" + rowId + " svg").classList.add('close');
};

export const enableButton = (rowId) => {
	document.querySelector("#bt_main_" + rowId).classList.remove('disabled');
	document.querySelector("#bt_toggle_" + rowId).classList.remove('disabled');
};

export const disableButton = (rowId) => {
	document.querySelector("#bt_main_" + rowId).classList.add('disabled');
	document.querySelector("#bt_toggle_" + rowId).classList.add('disabled');
};

export const setProgressValue = (rowId, percent) => {
	document.querySelector('#progress_bar_' + rowId).setAttribute('aria-valuenow', percent);
	document.querySelector('#progress_bar_' + rowId).setAttribute('style', 'width: ' + percent + '%;');
};

export const setMp3ProgressValue = (rowId, percent) => {
	let inverse = 100 - percent;
	document.querySelector('#progress_bar_' + rowId).setAttribute('aria-valuenow', inverse);
	document.querySelector('#progress_bar_' + rowId).setAttribute('style', 'width: ' + inverse + '%;');
	document.querySelector('#progress_bar_mp3_' + rowId).setAttribute('aria-valuenow', percent);
	document.querySelector('#progress_bar_mp3_' + rowId).setAttribute('style', 'width: ' + percent + '%;');
};

export const resetProgressBar = (rowId) => {
	document.querySelector('#progress_bar_container_' + rowId).innerHTML =
		'<div id="progress_bar_' + rowId + '" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="0"></div>';
};

export const resetMp3ProgressBar = (rowId) => {
	document.querySelector('#progress_bar_container_' + rowId).innerHTML =
		'<div id="progress_bar_mp3_' + rowId + '" class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>'
		+ '<div id="progress_bar_' + rowId + '" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>';
};

export const completeProgressBar = (rowId) => {
	document.querySelector('#progress_bar_' + rowId).classList.remove('progress-bar-striped');
	document.querySelector('#progress_bar_' + rowId).classList.remove('progress-bar-animated');
	document.querySelector('#progress_bar_' + rowId).classList.add('bg-success');
};

export const completeMp3ProgressBar = (rowId) => {
	document.querySelector('#progress_bar_mp3_' + rowId).classList.remove('progress-bar-striped');
	document.querySelector('#progress_bar_mp3_' + rowId).classList.remove('progress-bar-animated');
	setMp3ProgressValue(rowId, 100);
};

export const errorProgressBar = (rowId) => {
	document.querySelector('#progress_bar_' + rowId).classList.remove('progress-bar-striped');
	document.querySelector('#progress_bar_' + rowId).classList.remove('progress-bar-animated');
	document.querySelector('#progress_bar_' + rowId).classList.add('bg-danger');
	setProgressValue(rowId, 100);
};


export const showError = (ids, err) => {
	status(ids.rowId, 'Error');
	errorProgressBar(ids.rowId);
	console.log(err.message);
	let message = err.toString().split('\n')[1].split(':')[1];
	title(ids.rowId, message);
};

export const status = (rowId, status) => {
	document.querySelector("#td_status_" + rowId).innerHTML = status;
};

export const title = (rowId, title) => {
	document.querySelector("#td_title_" + rowId).innerHTML = title;
};

export const updateAfterInfo = (ids, titleName, download = false, callback = null) => {
	hideLoader(ids.rowId);
	title(ids.rowId, titleName);
	status(ids.rowId, 'Idle');
	document.querySelector("#dropdown_download_" + ids.rowId).innerHTML = makeDropdownFromFormats(ids);
	enableButton(ids.rowId);
	setTimeout(() => {
		document.querySelector("#bt_main_" + ids.rowId).onclick = (ev) => {
			mainDownloadClick(ids);
		};
		document.querySelectorAll("#dropdown_download_" + ids.rowId + " a").forEach((e)=>{
			e.onclick = (ev) => {
				downloadClick({
					id: ev.target.dataset.videoId,
					rowId: ev.target.dataset.rowId,
					formatId: ev.target.dataset.formatId
				});
			};
		});
		if(download){
			switch(download){
				case 'mp4':
					downloadVideo({
						id: ids.id,
						rowId: ids.rowId,
						formatId: 'mp4'
					});
					break;
				case 'mp3':
					downloadMp3(ids);
					break;
			}
		}
		if(callback != null) callback();
	},100);
}

export const getDownloadPath = () => {
	return document.querySelector('#directoryPickerLabel').innerHTML;
};
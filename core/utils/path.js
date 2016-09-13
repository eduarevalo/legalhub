// System
const os = require('os'),
	path = require('path'),
	fs = require("fs");
// Installed dependencies
const chance = require('chance').Chance();

var join = (array) => {
	return array.join(path.sep);
}

var getUploadPath = (options, cb) => {
	var options = options || {};
	var d = new Date();
	options.path = ['data', 'upload', d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() + '-' + d.getMinutes(), chance.guid()];
	return getPath(options, cb);
}

var getMediaFilePath = (options, cb) => {
	var options = options || {};
	options.file = chance.guid();
	return getMediaPath(options, cb);
}

var getMediaPath = (options, cb) => {
	var options = options || {};
	var d = new Date();
	options.path = ['data', 'media', d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() + '-' + d.getMinutes()];
	return getPath(options, cb);
}

var getTempFilePath = (options, cb) => {
	var options = options || {};
	options.file = chance.guid();
	return getTempPath(options, cb);
}

var getTempPath = (options, cb) => {
	var options = options || {};
	if(options.path == undefined){
		options.path = [os.tmpdir(), chance.guid()];
	}
	return getPath(options, cb);
}

var getPath = (options, cb) => {
	var sync = cb == undefined;
	var basePath = options.base ? options.base : '';
	var folder = options.path ? options.path : [];
	if(options.dir){
		folder.push(options.dir);
	}
	var path = '';
	if(sync){
		for(var it=0; it<folder.length; it++){
			path += folder[it];
			if (!fs.existsSync(basePath + path)){
				fs.mkdirSync(basePath + path);
			}
			path += "/";
		}
		if(options.file || options.ext){
			folder.push((options.file ? options.file : chance.guid()) + (options.ext ? ('.' + options.ext) : ''));
		}
		return folder;
	}
};

exports.join = join;
exports.getTempFilePath = getTempFilePath;
exports.getMediaFilePath = getMediaFilePath;
exports.getUploadPath = getUploadPath;
exports.getMediaPath = getMediaPath;
exports.getTempPath = getTempPath;
exports.getPath = getPath;
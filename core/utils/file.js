const chance = require('chance').Chance();

var getUploadPath = (options, cb) => {
	options.initialPath = ['data', 'upload'];
	return getPath(options, cb);
}

var getPath = (options, cb) => {
	var sync = cb == undefined;
	var basePath = options.base ? options.base : '';
	var folder = options.initialPath ? options.initialPath : [];
	var d = new Date();
	folder = folder.concat([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() + '-' + d.getMinutes(), chance.guid()]);
	if(options.folderName){
		folder.push(options.folderName);
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
		return folder;
	}
};

exports.getUploadPath = getUploadPath;
exports.getPath = getPath;
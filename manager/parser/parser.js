"use strict"; 
// System
const fs = require("fs");

// Project libraries
const pathUtils = require(__base + 'core/utils/path');

module.exports = class Parser{
  constructor(id){
	this.id = id;
  }
  marshall(data, cb){
    
  }
  unmarshall(data, cb){
    
  }
  saveOnDisk(stream, fileName, cb){
	var uploadPath = pathUtils.getUploadPath();
	uploadPath.push(fileName);
	var uploadFilePath = pathUtils.join(uploadPath);
	var fstream = fs.createWriteStream(uploadFilePath);
	stream.pipe(fstream);
	fstream.on('close', function() {
		cb({filePath: uploadFilePath, rendition: 'original'});
	});
  }
}

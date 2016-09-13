"use strict"; 

// Project libraries
const pathUtils = require(__base + 'core/utils/path');
  
var Parser = require(__base + 'manager/parser/parser');

module.exports = class BinaryParser extends Parser{
  parseContent(filePath, cb){
  
  };
  marshall(data, cb){
	this.saveOnDisk(data.file, data.fileName, cb);
	/*var uploadFilePath = pathUtils.join(uploadPath);
	var fstream = fs.createWriteStream(uploadFilePath);
	data.file.pipe(fstream);
	fstream.on('close', function() {
		cb({filePath: uploadFilePath, rendition: 'original'});
		parseContent(filePath, cb);
	});*/
  }
}
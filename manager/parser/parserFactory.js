var xpath = require('xpath')
  , dom = require('xmldom').DOMParser,
  Uslm1_0_15Parser = require(__base + 'manager/parser/uslm/uslm1_0_15Parser');
 
var xml = "<book><title>Harry Potter</title></book>"


var getParser = (fileName, fileContent) => {
	var parts = fileName.split('.');
	switch(parts[parts.length-1]){
		case 'xml':
			var doc = new dom().parseFromString(fileContent);
			var nodes = xpath.select("/@xmlns", doc);
			console.log(nodes);
			return new Uslm1_0_15Parser();
			
		default:
			throw new Error(`We're unable to guess your document type '${fileName}'`);
	}
};

exports.getParser = getParser;

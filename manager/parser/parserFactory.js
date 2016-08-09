var xpath = require('xpath')
  , dom = require('xmldom').DOMParser,
  Uslm1_0_15Parser = require(__base + 'manager/parser/uslm/uslm1_0_15Parser'),
  UsbillParser = require(__base + 'manager/parser/usbill/usbillParser');
 
var xml = "<book><title>Harry Potter</title></book>"


var getParser = (id) => {
	switch(id){
		case 'uslm1.0.15':
			return new Uslm1_0_15Parser();
		case 'usbill':
			return new UsbillParser();
	}
};

var guessParser = (fileName, fileContent) => {
	var parts = fileName.split('.');
	switch(parts[parts.length-1]){
		case 'xml':
			var doc = new dom().parseFromString(fileContent);
			var nodes = xpath.select("/@xmlns", doc);
			return this.getParser('uslm1.0.15');
			
		default:
			throw new Error(`We're unable to guess your document type '${fileName}'`);
	}
}

exports.getParser = getParser;
exports.guessParser = guessParser;

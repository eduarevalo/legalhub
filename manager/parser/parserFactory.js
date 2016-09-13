// Installed dependencies
const xpath = require('xpath'),
	dom = require('xmldom').DOMParser;

// Project libraries
var Uslm1_0_15Parser = require(__base + 'manager/parser/uslm/uslm1_0_15Parser'),
  UsbillParser = require(__base + 'manager/parser/usbill/usbillParser');
  PdfParser = require(__base + 'manager/parser/pdf/pdfParser'),
  BinaryParser = require(__base + 'manager/parser/binaryParser');
 
var getParser = (id) => {
	switch(id){
		case 'uslm1.0.15':
			return new Uslm1_0_15Parser();
		case 'usbill':
			return new UsbillParser();
		case 'pdf':
			return new PdfParser();
		case 'binary':
			return new BinaryParser();
	}
};

var guessParser = (fileName, fileContent) => {
	var parts = fileName.split('.');
	switch(parts[parts.length-1]){
		case 'xml':
			var doc = new dom().parseFromString(fileContent);
			var nodes = xpath.select("/@xmlns", doc);
			return this.getParser('uslm1.0.15');
		case 'pdf':
			return this.getParser('pdf');
		default:
			return this.getParser('binary');
	}
}

exports.getParser = getParser;
exports.guessParser = guessParser;

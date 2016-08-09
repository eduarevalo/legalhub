"use strict"; 

var fs = require('fs'),
  saxon = require('saxon-stream2');
  
var XmlParser = require(__base + 'manager/parser/xmlParser');

module.exports = class UsbillParser extends XmlParser{
  constructor() {
    super('usbill', 'http://xml.house.gov/schemas/uslm/1.0', __base + 'manager/parser/usbill/xsl/usbill2MicroData.xsl', __base + 'manager/parser/usbill/xsl/usbill2MicroData.xsl');
	this.dtdLocation = '';
  }
}

"use strict"; 
  
var XmlParser = require(__base + 'manager/parser/xmlParser');

module.exports = class Uslm1_0_15Parser extends XmlParser{
  constructor() {
    super('uslm1.0.15', 'http://xml.house.gov/schemas/uslm/1.0', __base + 'manager/parser/uslm/xsl/uslm2MicroData.xsl', __base + 'manager/parser/uslm/xsl/microData2Uslm.xsl');
	this.schemaLocation = __base + 'manager/parser/uslm/xsd/USLM-1.0.15.xsd';
  }
}

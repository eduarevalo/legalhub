"use strict"; 

var fs = require('fs'),
  saxon = require('saxon-stream2');
  
var XmlParser = require(__base + 'manager/parser/xmlParser');

module.exports = class Uslm1_0_15Parser extends XmlParser{
  constructor() {
    super('uslm1.0.15', 'http://xml.house.gov/schemas/uslm/1.0');
	this.schemaLocation = __base + 'manager/parser/uslm/xsd/USLM-1.0.15.xsd';
	this.marshallXSL = __base + 'manager/parser/uslm/xsl/uslm2MicroData.xsl';
	this.unmarshallXSL = __base + 'manager/parser/uslm/xsl/uslm2MicroData.xsl';
  }
  marshall(filePath, cb){
	console.log("marshalling" + filePath);
	
	var jarPath = __base + 'bin/Saxon/saxon9pe.jar';
    var xmlPath = filePath;
    var xslPath = this.marshallXSL;
	
	var outputPath = __dirname+'/out.txt';
	
	var xslt = saxon(jarPath,xslPath,{timeout:5000});
	
	var xslt = saxon(jarPath,xslPath,{timeout:5000});
	xslt.on('error',function(err){
	  console.log(err);
	});
	 
	var stream = fs.createReadStream(xmlPath,{encoding:'utf-8'}).pipe(
	  xslt
	);
	var content = '';
	stream.on('data',function(cont){
	  content += cont;
	});
	stream.on('end', function(){
		cb(content);
	});

  }
}

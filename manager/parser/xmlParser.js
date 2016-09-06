"use strict"; 
var fs = require('fs'),
  saxon = require('saxon-stream2');
  
var Parser = require(__base + 'manager/parser/parser');

module.exports = class XmlParser extends Parser{
  constructor(id, xmlns, marshallXSL, unmarshallXSL) {
	super(id);
	this.xmlns = xmlns;
	this.marshallXSL = marshallXSL;
	this.unmarshallXSL = unmarshallXSL;
  }
  marshall(filePath, cb){
	var jarPath = __base + 'bin/Saxon/saxon9pe.jar';
    var xmlPath = filePath;
    var xslPath = this.marshallXSL;
	var xslt = saxon(jarPath,xslPath,{timeout:5000});
	xslt.on('error',function(err){
	  console.log(err);
	});
	var stream = fs.createReadStream(xmlPath,{encoding:'utf-8'}).pipe(xslt);
	var content = '';
	stream.on('data',function(cont){
	  content += cont;
	});
	stream.on('end', function(){
		cb(content, 'editor');
	});
  }
}

"use strict"; 

var fs = require('fs'),
  saxon = require('saxon-stream2');
  
const os = require('os'),
  execSync = require('child_process').execSync;

var documentManager = require(__base + 'manager/document/documentManager');

var getRendition = (params, cb) => {
  documentManager.getLastVersion(params.id, function(err, version){
  if(err){
		cb(err);
	}
	getRenditionFromContent(params.type, version[0].content, cb);
  });
}

var getRenditionFromContent = (type, content, cb) => {
	var tempFile = os.tmpdir() + '/test1.html', outFile = os.tmpdir() + '/test2.' + type;
	if(type == 'pdf'){
		var cssStyle = [__base + 'view\\modules\\editor\\css\\paper.css', __base + 'view\\modules\\editor\\css\\common.css'];
		fs.writeFile(tempFile,wrapHtml(content, cssStyle), function(err) {
			if(err) {
				return console.log(err);
			}
			var cmd = [
			  `"C:/Program Files/Antenna House/AHFormatterV63/AHFCmd.exe"`,
			  '-d', `"${tempFile}"`,
			  '-o', `"${outFile}"`,
			  '-x', '4'
			].join(" ");
			console.log(cmd);
			var code = execSync(cmd);
			console.log(code);
			cb(null, outFile);
		}); 
	}else if(type == 'xml'){
		fs.writeFile(tempFile, content, function(err) {
			var jarPath = __base + 'bin/Saxon/saxon9pe.jar';
			var xmlPath = tempFile;
			var xslPath = __base + 'manager/parser/uslm/xsl/microData2Uslm.xsl';
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
				fs.writeFile(outFile,content, function(err) {
					cb(null, outFile);
				});
			});
		});
	}
}

var wrapHtml = function(content, styles){
content = content.replace('<?xml version="1.0" encoding="UTF-8"?>', '');
var style = '';
for(var i=0; i<styles.length; i++){
	style += `<link rel="stylesheet" type="text/css" href="${styles[i]}">`;
}
return `<!DOCTYPE HTML>
<html lang="en">
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	  ${style}
   </head>
   <body class="document">${content}</body></html>`;
}
exports.getRendition = getRendition;
exports.getRenditionFromContent = getRenditionFromContent;
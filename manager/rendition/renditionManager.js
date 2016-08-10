"use strict"; 

var fs = require('fs');
  
const os = require('os'),
  execSync = require('child_process').execSync;

var documentManager = require(__base + 'manager/document/documentManager');

var getRendition = (params, cb) => {
  documentManager.getLastVersion(params.id, function(err, version){
  if(err){
		cb(err);
	}
	var tempFile = os.tmpdir() + '/test1.html', outFile = os.tmpdir() + '/test2.pdf';
	var cssStyle = [__base + 'view\\modules\\editor\\css\\paper.css', __base + 'view\\modules\\editor\\css\\common.css'];
	fs.writeFile(tempFile,wrapHtml(version[0].content, cssStyle), function(err) {
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
  });
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
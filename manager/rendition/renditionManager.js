"use strict";

const fs = require('fs'),
  os = require('os'),
  chance = require('chance').Chance(),
  execSync = require('child_process').execSync,
  configuration = require(__base + 'configuration'),
  pdfUtils =  require(__base + 'core/utils/pdf'),
  xpath = require('xpath'),
  dom = require('xmldom').DOMParser;

var documentManager = require(__base + 'manager/document/documentManager');

var Document = require(__base + 'model/document/document');

var getDiff = (source, target, cb) => {
	var tempDir = os.tmpdir() + '/' + change.guid();
	if (!fs.existsSync(tempDir)){
		fs.mkdirSync(tempDir);
	}
  var aFile = tempDir + '/a.html', bFile = tempDir + '/b.html', outFile = tempDir + '/out.html', out2File = tempDir + '/out2.html';
  fs.writeFile(aFile, source, function(err) {
    fs.writeFile(bFile, target, function(err) {
      var jarPath = __base + 'bin/DaisyDiff/daisydiff.jar';
      var cmd = [
      `java -jar "${jarPath}"`,
      `"${bFile}"`,
      `"${aFile}"`,
      `--file="${outFile}"`,
      `--type=html`,
      `--output=xml`
      ].join(" ");
      
      var code = execSync(cmd);
      
      jarPath = __base + 'bin/Saxon/saxon9pe.jar';
      var xslPath = __base + 'manager/rendition/xsl/diffResult.xsl';
      cmd = [
      `java -jar "${jarPath}"`,
      `-s:"${outFile}"`,
      `-o:"${out2File}"`,
      `-xsl:"${xslPath}"`,
      `-warnings:silent`,
      ].join(" ");
      
      var code = execSync(cmd);
      
      cb(null, out2File);
    });
  });
}

var getRendition = (params, cb) => {
  documentManager.getLastVersion(params.id, function(err, version){
  if(err){
		cb(err);
	}
	if(version){
		getRenditionFromContent(params.type, version.content, '', params.renditionName, cb);	
	}else{
		cb('No version found.');
	}
  });
}

var getRenditionFromContent = (params, cb) => {

	var type = params.type, content = params.content, style = params.style;

	var tempDir = os.tmpdir() + '/' + chance.guid();
	if (!fs.existsSync(tempDir)){
		fs.mkdirSync(tempDir);
	}
	var inFile = tempDir + '/in.html', outFile = tempDir + '/out.' + type;
	
	var keepInDB = params.renditionName && params.documentId;
	if(keepInDB){
		var outFileDir = "data/upload/" + chance.string({length: 3});
		if (!fs.existsSync(outFileDir)){
			fs.mkdirSync(outFileDir);
		}
		outFile = outFileDir + '/out' + chance.guid() + '.' + type;
	}
	
	switch(type){
	
		case 'pdf':
			
			var cssStyle = [
				__base + 'view\\modules\\editor\\css\\'+style+'.css', 
				__base + 'view\\modules\\editor\\css\\common.css'
			];
			fs.writeFile(inFile,wrapHtml(content, cssStyle), function(err) {
				if(err) {
					return console.log(err);
				}
				var cmd;
				switch(configuration.formatters[type]){
					case "ah":
						cmd = [configuration.providers["ah"],
							  '-d', `"${inFile}"`,
							  '-o', `"${outFile}"`,
							  '-x', '4'
							].join(" ");
						break;
					case "prince":
						cmd = [configuration.providers["prince"],
								`"${inFile}"`,
								'-o', `"${outFile}"`].join(" ");
						break;
				}
				
				var code = execSync(cmd);
				
				if(params.renditionName && params.documentId){
				
					if(params.save && params.save === true){
						
						pdfUtils.extractTextWithLines(__base + outFile, function(err, xmlLineNumbersFile){
							if(err){
								cb(err);
							}
							
							var newContentFile = os.tmpdir() + '/' + chance.guid();
							var newContentOutFile = os.tmpdir() + '/' + chance.guid();
							console.log("savinf newCOntent" + newContentFile);
							/*fs.writeFile(newContentFile,content, function(err) {
								if(err) {
									return console.log(err);
								}
								
								var jarPath = configuration.providers.saxon;
								var xslPath = __base + "manager/parser/pdf/xsl/setLineNumbers.xsl";
								var cmd = [
								  `java -jar ${jarPath}`,
								  `-s:"${newContentFile}"`,
								  `-o:"${newContentOutFile}"`,
								  `-xsl:"${xslPath}"`,
								  `-warnings:silent`,
								  `lineNumbersFile="${xmlLineNumbersFile}"`,
								  ].join(" ");
								  console.log(cmd);
								
								var code = execSync(cmd);
								
								let document = new Document(params.documentId);
								
								console.log(" ====================================== " + newContentOutFile);
								documentManager.setContent(document, newContentOutFile, 'editor', '', function(){
									cb(null, newContentOutFile);
								});
								
							});*/
							
							var fileContent = fs.readFileSync(xmlLineNumbersFile, 'utf8');
							
							var doc = new dom().parseFromString(fileContent, "text/xml");
							var nodes = xpath.select("//line", doc);
							for(var it3=0; it3<nodes.length; it3++){
								if(nodes[it3].hasAttribute("number")){
									var lineNumber = nodes[it3].getAttribute("number");
									console.log(lineNumber);
									content = content.replace(nodes[it3].firstChild.data, "<a type=\"line-number\" number=\""+lineNumber+"\"></a>" + nodes[it3].firstChild.data);
								}
							}
							
							let document = new Document(params.documentId);
							documentManager.setContent(document, content, 'editor', '', function(){
								cb(null, __base + outFile);
							});							
							
						});
						
						let document = new Document(params.documentId);
						documentManager.setContent(document, outFile, type, params.renditionName, function(){
							cb(null, __base + outFile);
						});
						
					}else{					
					
						let document = new Document(params.documentId);
						documentManager.setContent(document, outFile, type, params.renditionName, function(){
							cb(null, outFile);
						});
					}
					
				}else{
					cb(null, outFile);
				}
			});
			
			break;
		
		case 'uslm':
	
			fs.writeFile(tempFile, content, function(err) {
				var jarPath = __base + 'bin/Saxon/saxon9pe.jar';
				var xslPath = __base + 'manager/parser/uslm/xsl/microData2Uslm.xsl';
				var cmd = [
				  `java -jar "${jarPath}"`,
				  `-s:"${tempFile}"`,
				  `-o:"${outFile}"`,
				  `-xsl:"${xslPath}"`,
				  `-warnings:silent`,
				  ].join(" ");
				  
				var code = execSync(cmd);
				  
				cb(null, outFile);
			});
			
			break;
	}
}

var wrapHtml = function(content, styles){
	content = content.replace('<?xml version="1.0" encoding="UTF-8"?>', '');
	var style = '';
	for(var i=0; i<styles.length; i++){
		style += `<link rel="stylesheet" type="text/css" href="${styles[i]}">`;
	}
	return `<!DOCTYPE HTML
	[<!ENTITY nbsp "&#160;">]>
	<html lang="en">
	   <head>
		  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		  ${style}
	   </head>
	   <body class="document">${content}</body></html>`;
}

var generateRendition = (type, content, style, cb) => {
};

exports.getDiff = getDiff;
exports.getRendition = getRendition;
exports.generateRendition = generateRendition;
exports.getRenditionFromContent = getRenditionFromContent;

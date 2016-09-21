"use strict";

// System
const fs = require('fs'),
  os = require('os'),
  execSync = require('child_process').execSync;

// Project dependencies
const chance = require('chance').Chance(),
  xpath = require('xpath'),
  dom = require('xmldom').DOMParser;

// Project libraries
const imageUtils = require(__base + 'core/utils/image'),
  xpathUtils = require(__base + 'core/utils/xpath'),
  pathUtils = require(__base + 'core/utils/path'),
  configuration = require(__base + 'configuration'),
  pdfUtils =  require(__base + 'core/utils/pdf'),
  stringUtils =  require(__base + 'core/utils/string');

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
  	if(version && version.content){
  		params.content = version.content;
  		getRenditionFromContent(params, cb);
  	}else{
  		cb('No version found.');
  	}
  });
}

var getRenditionFromContent = (params, cb) => {

	var type = params.type, content = params.content, style = params.style;

	var tempPath = pathUtils.getTempPath();
	var tempFilePath = pathUtils.getTempFilePath({ext: 'html'});

	var inFile = pathUtils.join(tempPath.concat(['in.html'])),
		outFile = pathUtils.join(tempPath.concat(['out.' + type]));

	var keepInDB = params.renditionName && params.documentId;
	if(keepInDB){
		outFile = pathUtils.join(pathUtils.getUploadPath()) + '/out' + chance.guid() + '.' + type;
	}

	switch(type){

		case 'pdf':

			var cssStyle = [
				__base + 'view\\modules\\editor\\css\\'+style+'.css',
				__base + 'view\\modules\\editor\\css\\common.css'
			];
			fs.writeFile(inFile, wrapHtml(content, cssStyle, params.schema), function(err) {
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

						var fragmentDate = new Date();

						pdfUtils.extractTextWithLines(__base + outFile, function(err, xmlLineNumbersFile){
							if(err){
								cb(err);
							}

              content = pdfUtils.setLineNumbers(xmlLineNumbersFile, content);

							let document = new Document(params.documentId);
							content = stringUtils.replaceAll('track="del"', 'itemtype="del"', stringUtils.replaceAll('track="add"', 'itemtype="add"', content));
							documentManager.setContent(document, {content: content, rendition: 'editor', date: fragmentDate, style: style, schema: params.schema});

						});

						let document = new Document(params.documentId);
						documentManager.setContent(document, {filePath: outFile, rendition: type, renditionName: params.renditionName, date: fragmentDate}, function(){
							cb(null, __base + outFile);
						});

					}else{

						let document = new Document(params.documentId);
						documentManager.setContent(document, {filePath: outFile, rendition: type, renditionName: params.renditionName}, function(){
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

var wrapHtml = function(content, styles, schema){
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
	   <body class="document" schema="${schema}">${content}</body></html>`;
}

var generateRendition = (type, content, style, cb) => {
};

exports.getDiff = getDiff;
exports.getRendition = getRendition;
exports.generateRendition = generateRendition;
exports.getRenditionFromContent = getRenditionFromContent;

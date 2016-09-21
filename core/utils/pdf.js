// System
const execSync = require('child_process').execSync,
	fs = require('fs'),
	xpath = require('xpath'),
	dom = require('xmldom').DOMParser;

// Installed dependencies
const chance = require('chance').Chance();

// Project libraries
const pathUtils = require(__base + 'core/utils/path'),
	configuration = require(__base + 'configuration');

var extractText = (options, cb) => {
	var tempFilePath = pathUtils.getTempFilePath();
	var tmpFile = pathUtils.join(tempFilePath);
	var mode = options.html ? '-html' : '';
    var cmd = [
      `${configuration.providers.pdfbox}`,
      `ExtractText ${mode}`,
	  `"${options.filePath}"`,
      `"${tmpFile}"`].join(" ");

	try{

		var code = execSync(cmd);
		var stream = fs.createReadStream(tmpFile, {encoding:'utf-8'});
		var content = '';
		stream.on('data',function(cont){
		  content += cont;
		});
		stream.on('end', function(){
			cb(null, content);
		});

	}catch(err){
		cb(err);
	}
}

var extractTextWithLines = (filePath, cb) => {

	extractText({filePath: filePath, html:true}, function(err, content){

		var start = content.indexOf('<body>');
		if(start > 0){
			content = content.substring(start);
			var end = content.indexOf('</body>');
			if(end > 0){
				content = content.substring(0, end + 7);

				var newTempInFile = pathUtils.getTempFilePath();
				var newTempInFilePath = pathUtils.join(newTempInFile);
				newTempInFile.pop();
				var newTempOutFilePath = pathUtils.join(pathUtils.getTempFilePath({path:newTempInFile}));

				fs.writeFile(newTempInFilePath, content, function(err) {

					if(err) {
						return console.log(err);
					}

					var saxonPath = configuration.providers.saxon;
					var xslPath = __base + "/manager/parser/pdf/xsl/pdfBoxOutputProcessor.xsl";
					var cmd = [
					  `${saxonPath}`,
					  `-s:"${newTempInFilePath}"`,
					  `-o:"${newTempOutFilePath}"`,
					  `-xsl:"${xslPath}"`,
					  `-warnings:silent`,
					  ].join(" ");

					var code = execSync(cmd);
					cb(null, newTempOutFilePath);

				});

			}
		}
	});
};

var setLineNumbers = (lineNumbersFile, content) => {
	var fileContent = fs.readFileSync(lineNumbersFile, 'utf8');
	var lineNumbersDoc = new dom().parseFromString(fileContent, "text/xml");
	var contentDoc = new dom().parseFromString(content, "text/xml");
	var lines = {};
	var nodes = xpath.select("//line", lineNumbersDoc);
	for(var it3=0; it3<nodes.length; it3++){
		if(nodes[it3].hasAttribute("number")){
			var lineNumber = nodes[it3].getAttribute("number");
			if(nodes[it3].firstChild){
				lines[lineNumber] = nodes[it3].firstChild.data;
			}
		}
	}
	console.log(lines);
	console.log(contentDoc);
}

exports.extractTextWithLines = extractTextWithLines;
exports.extractText = extractText;
exports.setLineNumbers = setLineNumbers;

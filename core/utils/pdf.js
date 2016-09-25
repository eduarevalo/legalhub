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
	var fileContent = fs.readFileSync(lineNumbersFile, 'utf8');console.log(fileContent);
	var lineNumbersDoc = new dom().parseFromString(fileContent, "text/xml");
	var contentDoc = new dom().parseFromString(content, "text/xml");
	var lines = [];
	var nodes = xpath.select("//line", lineNumbersDoc);
	for(var i=0; i<nodes.length; i++){
		if(nodes[i].hasAttribute("number")){
			var lineNumber = nodes[i].getAttribute("number");
			if(nodes[i].firstChild){
				lines.push({ number: lineNumber, text: nodes[i].firstChild.data.replace('"', '').replace('[','').replace(']', '') });
			}
		}
	}
	var position = 0;
	setLineNumber(contentDoc, lines, position);
	console.log(lines);
	return content;
}

var setLineNumber = (node, lines, position) => {
	if(node.data){
		// Paragraph contains all the line text
		console.log("position" + position);
		console.log(node.data);
		console.log(lines[position].text);
		console.log(node.data.indexOf(lines[position].text));
		if(node.data.indexOf(lines[position].text) > -1){
			if(lines[position].end == undefined){
				lines[position].end = node;
				lines[position].text = lines[position].text.substring(lines[position].text.indexOf(node.data) + node.data.length);
				position++;
				position = setLineNumber(node, lines, position);
			}
			
		// If the paragraph contains a part of the line text
		}else if(lines[position].text.indexOf(node.data) > -1){
			if(lines[position].start == undefined){
				lines[position].start = node;
			}
			/*console.log(lines[position].text);
			console.log(node.data);
			console.log(lines[position].text.indexOf(node.data));*/
			lines[position].text = lines[position].text.substring(lines[position].text.indexOf(node.data) + node.data.length);
	
		}
		return position;
	}else{
		for(var i=0; i<node.childNodes.length; i++){
			position = setLineNumber(node.childNodes[i], lines, position);
		}
	}
	return position;
};

exports.extractTextWithLines = extractTextWithLines;
exports.extractText = extractText;
exports.setLineNumbers = setLineNumbers;

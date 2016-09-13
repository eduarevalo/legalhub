// System
const execSync = require('child_process').execSync,
	fs = require('fs');

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

/*var setLineNumbers = (filePath, cb) => {
	if(cb){
		cb(null, filePath);
	}
}*/

exports.extractTextWithLines = extractTextWithLines;
exports.extractText = extractText;
//exports.setLineNumbers = setLineNumbers;
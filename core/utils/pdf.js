const os = require('os'),
	execSync = require('child_process').execSync,
	fs = require('fs'),
	chance = require('chance').Chance(),
	configuration = require(__base + 'configuration');

var extractTextWithLines = (filePath, cb) => {
console.log("------------------------------------------------------------------------------extractTextWithLines");
console.log("------------------------------------------------------------------------------extractTextWithLines" + filePath);
	var tmpDir = os.tmpdir() + '/' + chance.guid();
	if (!fs.existsSync(tmpDir)){
		fs.mkdirSync(tmpDir);
	}
	var tmpFile = tmpDir + "/" + chance.guid();
    var cmd = [
      `java -jar ${configuration.providers.pdfbox}`,
      `ExtractText -html`,
	  `"${filePath}"`,
      `"${tmpFile}"`].join(" ");
	  console.log(cmd);
	var code = execSync(cmd);
	var content;
	var stream = fs.createReadStream(tmpFile,{encoding:'utf-8'});
	var content = '';
	stream.on('data',function(cont){
	  content += cont;
	});
	stream.on('end', function(){
		var start = content.indexOf('<body>');
		if(start > 0){
			content = content.substring(start);
			var end = content.indexOf('</body>');
			if(end > 0){	
				content = content.substring(0, end + 7);
				
				var newTmpFile = os.tmpdir() + '/' + chance.guid();
				var newOutFile = os.tmpdir() + '/' + chance.guid();
				
				fs.writeFile(newTmpFile, content, function(err) {
				
					if(err) {
						return console.log(err);
					}
					
					var jarPath = configuration.providers.saxon;
					var xslPath = __base + "/manager/parser/pdf/xsl/pdfBoxOutputProcessor.xsl";
					var cmd = [
					  `java -jar "${jarPath}"`,
					  `-s:"${newTmpFile}"`,
					  `-o:"${newOutFile}"`,
					  `-xsl:"${xslPath}"`,
					  `-warnings:silent`,
					  ].join(" ");
					  console.log(cmd);
					  
					var code = execSync(cmd);
					cb(null, newOutFile);
					
				});
				
			}
		}
	});
};

var setLineNumbers = (filePath, cb) => {
	if(cb){
		cb(null, filePath);
	}
}

exports.extractTextWithLines = extractTextWithLines;
exports.setLineNumbers = setLineNumbers;
"use strict"; 
const os = require('os'),
	execSync = require('child_process').execSync,
	fs = require('fs'),
	chance = require('chance').Chance(),
	pdfUtils =  require(__base + 'core/utils/pdf');
	
  
var Parser = require(__base + 'manager/parser/parser');

module.exports = class PdfParser extends Parser{
  marshall(filePath, cb){
	pdfUtils.extractTextWithLines(filePath, function(err, file){
		if(err){
			cb(err);
		}
		
	});
	/*var tmpDir = os.tmpdir() + '/' + chance.guid();
	if (!fs.existsSync(tmpDir)){
		fs.mkdirSync(tmpDir);
	}
    var cmd = [
      __base + 'bin/Pdf2Text/pdf2text',
      `-o "${tmpDir}"`,
      `-f xml`,
      `--output_bbox "${filePath}"`].join(" ");
      console.log(cmd);
	/*var code = execSync(cmd);
	
	var outFile = tmpDir + ".xml";
	var xslPath = __base + 'manager/parser/pdf/xsl/pdf2Text.xsl';	
	
	var files = fs.readdirSync(tmpDir);
console.log(files);
	if(files.length >0){
		var jarPath = __base + 'bin/Saxon/saxon9pe.jar';
		cmd = [
		  `java -jar "${jarPath}"`,
		  `-s:"${files[0]}"`,
		  `-o:"${outFile}"`,
		  `-xsl:"${xslPath}"`,
		  `directory="${tmpDir}"`,
		  ].join(" ");
      console.log(cmd);
		var code = execSync(cmd);
		
		console.log(xslPath);
		
	}*/
  }
}
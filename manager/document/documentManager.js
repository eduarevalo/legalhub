"use strict";

// Utils
const chance = require('chance').Chance(),
  fs    = require("fs");
var imageUtils = require(__base + 'core/utils/image');

const configuration = require(__base + 'configuration');

// Models
var Document = require(__base + 'model/document/document'),
	Fragment = require(__base + 'model/document/fragment');
// Data Access
var documentDao = require(__base + 'dao/document/documentDao'),
	fragmentDao = require(__base + 'dao/document/fragmentDao'),
	versionDao = require(__base + 'dao/document/versionDao');
// Parsers
var parserFactory = require(__base + 'manager/parser/parserFactory');

var save = (document, content, renditionType, renditionName, cb) => {
  suggestProperties(document);
  documentDao.save(document, function(err, results){
    if(results.result.nModified > 0 || (results.result.upserted && results.result.upserted.length > 0)){
      if((document.id == undefined || document.id.length == 0) && results.result.upserted && results.result.upserted.length > 0 && results.result.upserted[0]._id){
        document.id = results.result.upserted[0]._id;
      }
    }
    if(content != undefined){
      setContent(document, content, renditionType, renditionName, cb);
    }else{
      cb(err, document);
    }
  });
}

var setContent = (document, content, renditionType, renditionName, cb) => {
	let fragment = new Fragment();
      fragment.documentId = document.id;
      fragment.startDate = new Date();
      fragment.type = '$root';
	  if(renditionType != 'editor' && fs.statSync(content)){
		fragment.filePath = content;
	  }else{
		fragment.content = content;
	  }
	  fragment.rendition = renditionType;
	  fragment.renditionName = renditionName;
      fragmentDao.save(fragment, function(err, fragment){
        cb(err, document, fragment);
      });
};

var search = (searchKeys, projectionKeys, cb) => {
  documentDao.search(searchKeys, projectionKeys, cb);
}

var suggestQrCode = (document) => {
  var type = 'svg';
  var imgPath = 'media/generated/' + document.code + '.' + type;
  var localPath = __base + 'view/' + imgPath;
  imageUtils.createQRCode(configuration.app.qrCodeDomain + document.code, type, localPath);
  return imgPath;
}

var suggestCode = (document) => {
  return chance.string({pool: document.title.replace(/ /gi, ''), length: 6});
}

var suggestProperties = (document) => {
  if(document.code == undefined){
    document.code = suggestCode(document)
  }
  if(document.qrCode == undefined){
    document.qrCode = suggestQrCode(document);
  }
  document.description = 'Description... to be extracted';
  document.documentType = 'AKN3.0';
  document.owner = 'earevalosuarez@gmail.com';
}

var saveWithContent = (content, renditionType, renditionName, fileName, collectionId, cb) => {
  let document = new Document();
  document.fileName = fileName;
  document.title = fileName.split('.')[0];
  document.setCollection(collectionId);
  save(document, content, renditionType, renditionName, cb);
}

var upload = (data, cb) => {
	var tmpPath = __base + "data/upload/" + chance.string({length: 3});
	if (!fs.existsSync(tmpPath)){
		fs.mkdirSync(tmpPath);
	}
	tmpPath += '/' + data.fileName;
	var fstream = fs.createWriteStream(tmpPath);
	data.file.pipe(fstream);
	fstream.on('close', function() {
		
		var parser = data.parser ? parserFactory.getParser(data.parser) : parserFactory.guessParser(data.fileName, data.file);
		if(parser){
			try{
					parser.marshall(tmpPath, function(content, type, name){
						saveWithContent(content, type, name, data.fileName, data.collectionId, cb);
					});
					return;
			}catch(err){
			  console.log(err);
			}
		}else{
			saveWithContent(tmpPath, 'original', '', data.fileName, data.collectionId, cb);
		}
		
	});
}

var getLastVersion = (documentId, cb) => {
  versionDao.getLastVersion(documentId, cb);
}

var getVersions = (documentId, cb) => {
  versionDao.getVersions(documentId, cb);
}

exports.getLastVersion = getLastVersion;
exports.getVersions = getVersions;
exports.save = save;
exports.setContent = setContent;
exports.search = search;
exports.upload = upload;

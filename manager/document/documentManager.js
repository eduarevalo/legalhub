"use strict";

// Utils
var chance = require('chance').Chance(),
  fs    = require("fs");
var imageUtils = require(__base + 'core/utils/image');

// Models
var Document = require(__base + 'model/document/document'),
	Fragment = require(__base + 'model/document/fragment');
// Data Access
var documentDao = require(__base + 'dao/document/documentDao'),
	fragmentDao = require(__base + 'dao/document/fragmentDao'),
	versionDao = require(__base + 'dao/document/versionDao');
// Parsers
var parserFactory = require(__base + 'manager/parser/parserFactory');

var save = (document, cb) => {
  var type = 'svg';
  var imgPath = 'media/generated/' + document.code + '.' + type;
  var localPath = __base + 'view/' + imgPath;
  imageUtils.createQRCode("http://legalhub.vimmit.com/document/" + document.code, type, localPath);
  document.qrCode = imgPath;
  documentDao.save(document, function(err, results){
    if(results.result.nModified > 0 || (results.result.upserted && results.result.upserted.length > 0)){
      if(results.result.upserted && results.result.upserted.length > 0 && results.result.upserted[0]._id){
        document.id = results.result.upserted[0]._id;
      }
    }
    cb(err, document, results);
  });
}

var search = (searchKeys, projectionKeys, cb) => {
  documentDao.search(searchKeys, projectionKeys, cb);
}

var uploadContent = (content, fileName, collectionId, cb) => {
  let document = new Document();
  document.fileName = fileName;
  document.title = fileName.split('.')[0];
  document.code = chance.string({pool: document.title.replace(/ /gi, ''), length: 6});
  document.description = 'Description... to be extracted';
  document.documentType = 'AKN3.0';
  document.owner = 'earevalosuarez@gmail.com';
  document.setCollection(collectionId);
  save(document, function(err, savedDocument){
    console.log("savedDocument");
    console.log(savedDocument);
    if(err){
      throw err;
    }
    let fragment = new Fragment();
    fragment.documentId = savedDocument.id;
    fragment.startDate = new Date();
    fragment.type = '$root';
    fragment.content = content;
    fragmentDao.save(fragment, function(err, fragment){
      if(err){
        // delete
      }
      cb(err, fragment);
    });
  });
}

var upload = (data, cb) => {
  var tmpPath = "data/upload/" + data.fileName;
  fs.writeFile(__base + tmpPath, data.fileContent, function(err) {
    if(err) {
      return console.log(err);
    }
    try{
	     var parser = data.parser ? parserFactory.getParser(data.parser) : parserFactory.guessParser(data.fileName, data.fileContent);
       parser.marshall(tmpPath, function(content){
         uploadContent(content, data.fileName, data.collectionId, cb);
       });
       return;
    }catch(err){
      console.log(err);
    }
    uploadContent(data.fileContent, data.fileName, data.collectionId, cb);
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
exports.search = search;
exports.upload = upload;

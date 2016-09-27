"use strict";

// System
const path = require('path'), fs = require('fs');

// Installed dependencies
const chance = require('chance').Chance(),
  xpath = require('xpath'),
  dom = require('xmldom').DOMParser;

// Project libraries
const imageUtils = require(__base + 'core/utils/image'),
  xpathUtils = require(__base + 'core/utils/xpath'),
  pathUtils = require(__base + 'core/utils/path'),
  configuration = require(__base + 'configuration');

// Models
var Document = require(__base + 'model/document/document'),
	Fragment = require(__base + 'model/document/fragment');
// Data Access
var documentDao = require(__base + 'dao/document/documentDao'),
	fragmentDao = require(__base + 'dao/document/fragmentDao'),
	versionDao = require(__base + 'dao/document/versionDao');
// Parsers
var parserFactory = require(__base + 'manager/parser/parserFactory');

var save = (document, params, cb) => {
  suggestProperties(document);
  if(params && params.rendition == 'editor' && params.content != undefined){
	extractDocumentPropertiesFromContent(params.content, document);
  }
  if(document.id == undefined || document.id.length == 0){
	document.creationDate = new Date();
  }
  document.lastModificationDate = new Date();
  documentDao.save(document, function(err, results){
    if(results.result.nModified > 0 || (results.result.upserted && results.result.upserted.length > 0)){
      if((document.id == undefined || document.id.length == 0) && results.result.upserted && results.result.upserted.length > 0 && results.result.upserted[0]._id){
        document.id = results.result.upserted[0]._id;
      }
    }
	if(params){
		setContent(document, params, cb);
	}
  });
}

var setContent = (document, params, cb) => {
	let fragment = new Fragment();
      fragment.documentId = document.id;
      fragment.startDate = params.date ? params.date : new Date();
      fragment.type = '$root';
	  fragment.update(params);
	  extractLinksFromContent(fragment);
	  extractPropertiesFromContent(fragment);
      fragmentDao.save(fragment, function(err, fragment){
		if(cb){
			cb(err, document, fragment);
		}
      });
};

var search = (searchKeys, projectionKeys, cb) => {
  documentDao.search(searchKeys, projectionKeys, function(err, documents){

	  var promises = documents.map(function(document){

        return new Promise(function(resolve, reject) {

          getRenditions(document.id, function(err, renditions){
            try{
              document.renditions = renditions;
              resolve(true);
            }catch(err){
              reject(err);
            }
          });
        });
      });
      Promise.all(promises).then(function(){
        cb(err, documents);
      });

  });
}

var suggestQrCode = (document) => {
  var type = 'svg';
  var imgPath = pathUtils.join(pathUtils.getMediaFilePath({ext: type}));
  imageUtils.createQRCode(configuration.app.qrCodeDomain + document.code, type, imgPath);
  return imgPath;
}

var suggestCode = (document) => {
  return chance.string({pool: document.title.replace(/ /gi, ''), length: 6});
}

var suggestProperties = (document) => {
  if(document.code == undefined){
    document.code = suggestCode(document)
  }
  if(document.qrCode == undefined || !fs.existsSync(document.qrCode)){
    document.qrCode = suggestQrCode(document);
  }
}

var extractDocumentPropertiesFromContent = (content, document) => {
	var doc = new dom().parseFromString(content, "text/xml");
	var longTitleNodes = xpath.select("//*[@itemtype='longTitle']//text()", doc);
	if(longTitleNodes.length>0){
		document.longTitle = '';
		for(var it=0; it<longTitleNodes.length; it++){
			document.longTitle += longTitleNodes[it].toString();
		}
	}
};

var extractLinksFromContent = (fragment) => {
	if(fragment.rendition == 'editor'){
		switch(fragment.schema){
			case 'amendment':
				var links = [];
				var billNumber;
				var documentId
				var doc = new dom().parseFromString(fragment.content, "text/xml");
				var billNumberNodes = xpath.select("//*[@itemtype='billNumber']", doc);
				if(billNumberNodes.length>0){
					billNumber = xpathUtils.getText(billNumberNodes);
					if(billNumberNodes[0].hasAttribute("idref")){
						documentId = billNumberNodes[0].getAttribute("idref");
					}
				}
				var refLines = xpath.select("//p[child::span[@itemtype='ref']]", doc);
				for(var it=0; it<refLines.length; it++){
					var link = { type: 'amending' };
          if(billNumber){
            link.bill = billNumber;
          }
          if(documentId){
            link.idref = documentId;
          }
					link.instruction = xpathUtils.getText(refLines[it]);
					var matches = link.instruction.split(/(strike|insert)\s*\"([^\"]+)\"/gi);
					var insert = false, strike = false;
					for(var i=0; i<matches.length; i++){
						if(matches[i].toLowerCase() == 'strike' && matches[i+1]){
							strike = true;
							link.anchor = matches[i+1];
						}else if(matches[i].toLowerCase() == 'insert' && matches[i+1]){
							link.text = matches[i+1];
							insert = true;
						}
					}
					if(insert && strike){
						link.action = 'replace';
					}
					var from = undefined, to = undefined;
					var matches = xpathUtils.getText(xpath.select("./span[@itemtype='ref']", refLines[it])).match(/([0-9])*/gi);
					for(var i=0; i<matches.length; i++){
						var numberValue = parseInt(matches[i]);
						if(Number.isInteger(numberValue)){
							if(from == undefined){
								from = numberValue;
							}else if(to == undefined){
								to = numberValue;
							}
						}
					}
					link.scope = {};
					if(from && to){
						link.scope.lines = [];
						for(var i=from; i<to+1; i++){
							link.scope.lines.push(i);
						}
					}else if(from){
						link.scope.lines = [from];
					}
					links.push(link);
				}
				if(links.length > 0){
					fragment.links = links;
				}
				break;
		}
	}
}

var extractPropertiesFromContent = (fragment) => {

}

var saveRendition = (params, collectionId, cb) => {
  let document = new Document();
  document.title = path.parse(params.filePath).name;
  document.setCollection(collectionId);
  save(document, params, cb);
}

var upload = (data, cb) => {
	try{

		var parser = data.parser ? parserFactory.getParser(data.parser) : parserFactory.guessParser(data.fileName, data.file);
		if(parser){

			parser.marshall(data, function(params){

				// Could be called mutiple times depending on the parser
				saveRendition(params, data.collectionId, cb);

			});

		}else{

			// Original format upload
			saveRendition({filePath: uploadFilePath, rendition: 'original'}, data.collectionId, cb);
		}

	}catch(err){
	  console.log(err);
	}
}

var getLastVersion = (params, cb) => {
  versionDao.getLastVersion(params, cb);
}

var getRenditions = (documentId, cb) => {
	versionDao.getLastVersion({documentId: documentId}, function(err, version){
		if(err){
			cb(err, version);
		}else if(version){
			versionDao.getRenditions({documentId: version.documentId, date: version.startDate}, cb);
		}
	});
}

var getVersions = (documentId, cb) => {
  versionDao.getVersions(documentId, cb);
}

var getLinkedDocuments = (documentId, linkType, cb) => {
  versionDao.getLinkedVersions(documentId, linkType, cb);
}

exports.getLastVersion = getLastVersion;
exports.getVersions = getVersions;
exports.getLinkedDocuments = getLinkedDocuments;
exports.save = save;
exports.setContent = setContent;
exports.search = search;
exports.upload = upload;
exports.suggestQrCode = suggestQrCode;

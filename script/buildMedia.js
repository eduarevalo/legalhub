global.__base = __dirname + '/../';

const fs = require('fs');

var Document = require(__base + 'model/document/document');
var documentManager = require(__base + 'manager/document/documentManager');
var documentDao = require(__base + 'dao/document/documentDao');
var db = require(__base + 'core/db/db');
var configuration = require(__base + 'configuration');


db.connect(configuration.db[0].url, function(){
  console.log("db connected");
  documentManager.search({}, {}, function(err, documents){
	console.log("search()");
	documents.forEach(function(document){
		console.log("each");
		console.log(document.qrCode);
		if(document.qrCode == undefined || !fs.existsSync(__base + document.qrCode)){
			documentManager.suggestQrCode(document);
			console.log(document.qrCode);
			documentManager.save(document, null, function(err, document){
				console.log("Saved");
			});
		}
	});
  });
});
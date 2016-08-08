var express = require('express');
var fs    = require("fs");
var router = express.Router();

var documentManager = require(__base + 'manager/document/documentManager');
var Document = require(__base + 'model/document/document');

/* search */
router.get('/search', function (req, res) {
  var projectionModel = req.query['$projection'] ? req.query['$projection'].split(',') : [];
  delete req.query['$projection'];
  documentManager.search(req.query, projectionModel, function(err, documents){
    if(err){
      res.json({success: false, error: err});
    }else{
      res.json({success: true, data: documents});
    }
  });
});
/* upload */
router.post('/upload', function (req, res, next) {
  req.pipe(req.busboy);
  var fileContent = '';
  var fileName = '';
  var collectionId = '';
  var fileExtension = '';
  req.busboy.on('file', function (fieldname, file, filename) {
    fileName = filename;
    fileExtension = filename.split('.');
    fileExtension = fileExtension[fileExtension.length-1];
    file.on('data', function(chunk) {
      fileContent += chunk;
    });
  });
  req.busboy.on('field', function(fieldname, val){
    if(fieldname == 'collection'){
      collectionId = val;
    }
  });
  req.busboy.on('finish', function(){
    documentManager.upload({
      fileName: fileName,
      fileContent: fileContent,
      collectionId: collectionId
    }, function(err, document){
      if(err){
        res.json({success: false, error: err});
      }else{
        res.json({success: true});
      }
    });
  });
});

module.exports = router;

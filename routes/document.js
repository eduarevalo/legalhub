"use strict";

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
/* links */
router.get('/links', function (req, res) {
  documentManager.getLinkedDocuments(req.query.documentId, req.query.linkType, function(err, documents){
    if(err){
      res.json({success: false, error: err});
    }else{
      res.json({success: true, data: documents});
    }
  });
});

/* save */
router.post('/save', function (req, res) {
  let document = new Document();
  document.update(req.body);
  if(req.body.collectionId){
    document.setCollection(req.body.collectionId);
  }
  var params = req.body;
  params.rendition = 'editor';
  documentManager.save(document, params, function(err, document){
    if(err){
      res.json({success: false, error: err});
    }else{
      res.json({success: true, code: document.code, id: document.id});
    }
  });
});

/* upload */
router.post('/upload', function (req, res, next) {
  req.pipe(req.busboy);
  var collectionId = req.query['collection'] ? req.query['collection'] : '';
  var parser = req.query['parser'] ? req.query['parser'] : '';
  req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
  
	var fileExtension = filename.split('.');
	var fileContent = '';
    fileExtension = fileExtension[fileExtension.length-1];
	documentManager.upload({
	    file: file,
		fileName: filename,
	    collectionId: collectionId,
		parser: parser 
	});  
  });
  req.busboy.on('field', function(fieldname, val){
    if(fieldname == 'collection'){
      collectionId = val;
    }
  });
  req.busboy.on('finish', function(){
    res.json({success: true});
  });
});

module.exports = router;

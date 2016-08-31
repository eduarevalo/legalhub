"use strict";

var Document = require(__base + 'model/document/document');
var db = require(__base + 'core/db/db');
var ObjectID = require('mongodb').ObjectID;

var collectionName = 'document';

exports.getDocumentById = (id, callback) => {
  db.find(collectionName, {_id: new ObjectID(id)}, {}, function(doc){
    callback(fromDocument(doc));
  });
}

exports.getDocumentByCode = (code, callback) => {
  db.find(collectionName, {code: code}, {}, function(doc){
    callback(fromDocument(doc));
  });
}

exports.getDocumentsCountByCollection = (collection, cb) => {
  db.count(collectionName, {collections: ""+collection}, {}, cb);
}

exports.search = (collectionModel, projection, cb) => {
  projection = projection || {};
  db.findAll(collectionName, toQuery(collectionModel), {}, function(err, documents){
    cb(err, fromDocument(documents));
  });
}

exports.save = (document, cb) => {
  db.save(collectionName, toObject(document), {}, cb);
}

exports.insert = (documents, callback) => {
  db.insert(collectionName, toObject(documents), {}, callback);
}

exports.drop = (callback) => {
  db.drop(collectionName, callback);
}

var fromDocument = (doc) => {
  if(doc == null){
    return null;
  }
  var isArray = Array.isArray(doc);
  if(!isArray) doc = [doc];
  var output = [];
  for(let it=0; it<doc.length; it++){
    let document = new Document(doc[it]._id);
    document.update(doc[it]);
    output.push(document);
  }
  return isArray ? output : output[0];
}
var toQuery = (document) => {
  var query = {};
  if(document.id){
    query._id = new ObjectID(document.id);
  }
  if(document.code){
    query.code = document.code;
  }
  if(document.title){
    query.title = document.title;
  }
  if(document.collections){
    query.collections = document.collections;
  }
  return query;
}
var toObject = (document) => {
  var obj = document.toObject();
  obj._id = new ObjectID(obj.id);
  delete obj.id;
  return obj;
}

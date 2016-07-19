var Document = require(__base + 'model/document/document');
var db = require(__base + 'core/db/db');

var collectionName = 'document';

exports.getDocumentById = (id, callback) => {
  db.find(collectionName, {_id: id}, {}, function(doc){
    callback(fromDocument(doc));
  });
}

exports.getDocumentByCode = (code, callback) => {
  db.find(collectionName, {code: code}, {}, function(doc){
    callback(fromDocument(doc));
  });
}

exports.search = (documentModel, callback) => {
  db.findAll(collectionName, toQuery(documentModel), {}, callback);
}

exports.save = (document, callback) => {
  db.save(collectionName, toDocument(document), {}, callback);
}

exports.insert = (documents, callback) => {
  db.insert(collectionName, toDocument(documents), {}, callback);
}

var fromDocument = (doc) => {
  if(doc)
    return new Document(doc.id, doc.code, doc.title, doc.properties, doc.parts);
  return null;
}
var toDocument = (document) => {
  var isArray = Array.isArray(document);
  if(!isArray) document = [document];
  var output = [];
  for(let it=0; it<document.length; it++){
    if(document[it] instanceof Document){
      output.push({
        _id: document[it].id,
        code: document[it].code,
        title: document[it].title,
        properties: document[it].properties,
        parts: document[it].parts
      });
    }else{
      output.push(document[it]);
    }
  }
  return isArray ? output : output[0];
}
var toQuery = (document) => {
  var query = {};
  if(document.id){
    query._id = document.id;
  }
  if(document.code){
    query.code = document.code;
  }
  if(document.title){
    query.title = document.title;
  }
  return query;
}

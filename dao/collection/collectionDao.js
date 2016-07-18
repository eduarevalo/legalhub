var Collection = require(__base + 'model/collection/collection');
var db = require(__base + 'core/db/db');

var collectionName = 'collection';

exports.getCollectionById = (id, callback) => {
  db.find(collectionName, {_id: id}, {}, function(doc){
    callback(fromDocument(doc));
  });
}

exports.getCollectionByCode = (code, callback) => {
  db.find(collectionName, {code: code}, {}, function(doc){
    callback(fromDocument(doc));
  });
}

exports.search = (collectionModel, callback) => {
  db.findAll(collectionName, toQuery(collectionModel), {}, callback);
}

exports.save = (collection, callback) => {
  db.save(collectionName, toDocument(collection), {}, callback);
}

var fromDocument = (doc) => {
  if(doc)
    return new Collection(doc.id, doc.code, doc.title, doc.description);
  return null;
}
var toDocument = (collection) => {
  if(collection){
    return {
      _id: collection.id,
      code: collection.code,
      title: collection.title,
      description: collection.description
    };
  }
  return {};
}
var toQuery = (collection) => {
  var query = {};
  if(collection.id){
    query._id = collection.id;
  }
  if(collection.code){
    query.code = collection.code;
  }
  if(collection.title){
    query.title = collection.title;
  }
  if(collection.description){
    query.description = collection.description;
  }
  return query;
}

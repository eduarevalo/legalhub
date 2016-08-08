var Collection = require(__base + 'model/collection/collection');
var db = require(__base + 'core/db/db');
var ObjectID = require('mongodb').ObjectID;
var documentDao = require(__base + 'dao/document/documentDao');

var collectionName = 'collection';

exports.getCollectionById = (id, cb) => {
  db.findAll(collectionName, {_id: new ObjectID(id)}, {}, function(err, docs){
    cb(err, fromDocument(docs));
  });
}

exports.getCollectionByCode = (code, cb) => {
  db.findAll(collectionName, {code: code}, {}, function(err, docs){
    cb(err, fromDocument(docs));
  });
}

exports.search = (searchKeys, projection = {},  cb) => {
  var countKeyIndex = projection.indexOf('count');
  if(countKeyIndex>-1){
    projection.splice(countKeyIndex, 1 );
  }
  if(projection.length>0){
    projection.push("_id");
  }
  if(searchKeys.id){
    searchKeys._id = new ObjectID(searchKeys.id);
    delete searchKeys.id;
  }
  console.log(searchKeys);
  db.findAll(collectionName, searchKeys, projection, function(err, collections){
    console.log(collections);
    for(var it in collections){
      var collection = new Collection(collections[it]._id);
      collection.update(collections[it]);
      collections[it] = collection;
    }
    if(countKeyIndex>-1){
      var promises = collections.map(function(collection){
        return new Promise(function(resolve, reject) {
          documentDao.getDocumentsCountByCollection(collection.id, function(count){
            try{
              collection.count = count;
              resolve(true);
            }catch(err){
              reject(err);
            }
          });
        });
      });
      Promise.all(promises).then(function(){
        cb(err, collections);
      });
    }else{
      cb(err, collections);
    }
  });
}

exports.save = (collection, callback) => {
  db.save(collectionName, toDocument(collection), {}, callback);
}

exports.insert = (collections, callback) => {
  db.insert(collectionName, toDocument(collections), {}, callback);
}

exports.count = (collectionModel, callback) => {
  db.count(collectionName, toQuery(collectionModel), callback);
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
    let collection = new Collection(doc[it]._id);
    collection.update(doc[it]);
    output.push(collection);
  }
  return isArray ? output : output[0];
}
var toDocument = (collection) => {
  var isArray = Array.isArray(collection);
  if(!isArray) collection = [collection];
  var output = [];
  for(let it=0; it<collection.length; it++){
    if(collection[it] instanceof Collection){
      output.push({
        _id: new ObjectID(collection[it].id),
        code: collection[it].code,
        title: collection[it].title,
        description: collection[it].description,
        color: collection[it].color,
        classifier: collection[it].classifier,
        public: collection[it].public,
        qrCode: collection[it].qrCode,
        icon: collection[it].icon
      });
    }else{
      output.push(collection[it]);
    }
  }
  return isArray ? output : output[0];
}
var toQuery = (collection) => {
  if(collection instanceof Collection){
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
    if(collection.collections){
      query.collections = collection.collections;
    }
    return query;
  }
  return collection;
}
var toProjectionKeys = (keys) => {
  var object = {};
  for(let it=0; it<keys.length; it++){
    object[keys[it]] = 1;
  }
  return object;
}

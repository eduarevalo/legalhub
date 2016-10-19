var mongodb = require('mongodb');
var ObjectID = mongodb.ObjectID;
var MongoClient = mongodb.MongoClient;
var db;

exports.connect = function(url, cb) {
  MongoClient.connect(url, function(err, database) {
    if(err){
      cb(err);
    }else{
      db = database;
      cb(null);
    }
  });
}

exports.find = function(collection, query, projection, cb){
  if(!db){
    throw Error(`Db connection not established: ${mongoUrl}. Are you connecting before?`);
  }
  var cursor = db.collection(collection).find(query, projection);
  cursor.each(function(err, doc){
	if(doc){
		cb(null, doc);
	}
  });
}

exports.findSortLimit = function(collection, query, projection, sort, limit, cb){
  if(!db){
    throw Error(`Db connection not established: ${mongoUrl}. Are you connecting before?`);
  }
  db.collection(collection).find(query, projection).sort(sort).limit(limit).toArray(cb);
}

exports.findAll = function(collection, query, projection, cb){
	db.collection(collection).find(query, projection).toArray(cb);
}

exports.save = function(collection, document, options, cb){
  db.collection(collection).save(document, options, cb);
}

exports.insert = function(collection, documents, options, cb){
  db.collection(collection).insert(documents, options, cb);
}

exports.count = function(collection, query, options, callback){
  db.collection(collection).count(query, function(err, count){
    if(err) throw err;
    callback(count);
  });
}

exports.delete = function(collection, query, callback){
  db.collection(collection).deleteOne(query, function(err, docs) {
    if(err) throw err;
    callback(docs);
  });
}

exports.drop = function(collection, callback){
  db.collection(collection).drop(function(err, response) {
    if(err) throw err;
    callback();
  });
}

exports.getId = function(id){
	return id ? new ObjectID(id) : new ObjectID();
}
var mongodb = require('mongodb');
var configuration = require(__base + 'configuration');
var MongoClient = mongodb.MongoClient;
var mongoUrl = configuration.db[0].url;
var db;

exports.connect = function(callback) {
  MongoClient.connect(mongoUrl, function(err, database) {
    if(err) throw err;
    db = database;
    callback();
  });
}

exports.find = function(collection, query, options, callback){
  if(!db){
    throw Error(`Db connection not established: ${mongoUrl}. Are you connecting before?`);
  }
  var cursor = db.collection(collection).find(query, options);
  cursor.each(function(err, doc){
  	if(err)	throw err;
  	callback(doc);
  });
}

exports.findAll = function(collection, query, options, callback){
	db.collection(collection).find(query, options).toArray(function(err, docs){
    	if(err)	throw err;
    	callback(docs);
	});
}

exports.save = function(collection, document, options, callback){
  db.collection(collection).save(document, options, callback);
}

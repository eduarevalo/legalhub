'use strict';

var User = require(__base + 'model/user/user');
var db = require(__base + 'core/db/db');

var collection = 'user';

exports.getUserById = (id, cb) => {
  db.find(collection, {_id: id}, {}, function(err, doc){
    cb(err, fromDocument(doc));
  });
}

exports.getUserByEmail = (email, cb) => {
  db.find(collection, { email: email }, {}, function(err, user){
	cb(err, fromDocument(user));
  });
}

exports.search = (userModel, projection, cb) => {
  db.findAll(collection, toQuery(userModel), projection, function(err, results){
	cb(err, fromDocument(results));
  });
}

exports.save = (user, cb) => {
  db.save(collection, toObject(user), {}, cb);
}

exports.insert = (user, cb) => {
  db.insert(collection, toObject(user), {}, cb);
}


var fromDocument = (doc) => {
  if(doc == null){
    return null;
  }
  var isArray = Array.isArray(doc);
  if(!isArray) doc = [doc];
  var output = [];
  for(var it=0; it<doc.length; it++){
    let user = new User(doc[it]._id);
    user.update(doc[it]);
    output.push(user);
  }
  return isArray ? output : output[0];
}

var toQuery = (user) => {
  var query = {};
  if(user.id){
    query._id = new ObjectID(user.id);
  }
  if(user.email){
    query.email = user.email;
  }
  return query;
}

var toObject = (user) => {
  var isArray = Array.isArray(user);
  if(!isArray) user = [user];
  var output = [];
  for(var it=0; it<user.length; it++){
	var obj = user[it].toObject();
	obj._id = db.getId(obj.id);
	delete obj.id;
	output.push(obj);
  }
  return isArray ? output : output[0];
}

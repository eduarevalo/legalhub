var User = require(__base + 'model/user/user');
var db = require(__base + 'core/db/db');

var collection = 'user';

exports.getUserById = (id, callback) => {
  db.find(collection, {_id: id}, {}, function(doc){
    callback(fromDocument(doc));
  });
}

exports.getUserByEmail = (email, callback) => {
  db.find(collection, { email: email }, {}, function(doc){
    callback(fromDocument(doc));
  });
}

exports.search = (userModel, callback) => {
  db.findAll(collection, toQuery(userModel), {}, callback);
}

exports.save = (user, callback) => {
  db.save(collection, toDocument(user), {}, callback);
}

var fromDocument = (doc) => {
  if(doc)
    return new User(doc.id, doc.email);
  return null;
}
var toDocument = (user) => {
  if(user){
    return { _id: user.id, email: user.email };
  }
  return {};
}
var toQuery = (user) => {
  var query = {};
  if(user.id){
    query._id = user.id;
  }
  if(user.email){
    query.email = user.email;
  }
  return query;
}

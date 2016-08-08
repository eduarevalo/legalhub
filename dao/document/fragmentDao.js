var Fragment = require(__base + 'model/document/fragment');
var db = require(__base + 'core/db/db');
var ObjectID = require('mongodb').ObjectID;

var collectionName = 'fragment';

exports.getFragment = (fragmentId, cb) => {
  db.find(collectionName, {
    _id: new ObjectID(fragmentId)
  },
  {},
  function(results){
    cb(toFragment(results));
  });
}


var save = (fragment, cb) => {
  db.save(collectionName, toObject(fragment), {}, cb);
}
exports.save = save;

var toFragment = (obj) => {
  if(obj == null){
    return null;
  }
  var isArray = Array.isArray(obj);
  if(!isArray) obj = [obj];
  var output = [];
  for(let it=0; it<obj.length; it++){
    let fragment = new Fragment(obj[it]._id);
    fragment.update(obj[it]);
    output.push(fragment);
  }
  return isArray ? output : output[0];
}
var toObject = (fragment) => {
  var obj = fragment.toObject();
  fragment._id = new ObjectID(obj.id);
  delete obj.id;
  return obj;
}

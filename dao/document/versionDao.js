"use strict"; 

var Version = require(__base + 'model/document/version');
var db = require(__base + 'core/db/db');
var ObjectID = require('mongodb').ObjectID;

var collectionName = 'fragment';

const versionFields = {
  _id:1,
  documentId:1,
  startDate:1,
  endDate:1,
  status:1,
  type:1
};

exports.getVersion = (documentId, startDate, cb) => {
  db.find(collectionName, {
      documentId: new ObjectID(documentId),
      startDate: startDate,
      type: '$root'
    },
    versionFields,
    function(results){
      cb(toVersion(results));
    });
}

exports.getVersions = (documentId, cb) => {
  db.findSortLimit(collectionName, {
      documentId: new ObjectID(documentId),
      type: '$root'
    },
    versionFields,
    {startDate:-1},
    0,
    function(err, results){
      cb(err, toVersion(results));
    });
}

exports.getLastVersion = (documentId, cb) => {
  db.findSortLimit(collectionName, {
    documentId: new ObjectID(documentId),
    type: '$root'
  },
  { content: 1 },
  {startDate:-1},
  1,
  function(err, results){
    cb(err, toVersion(results));
  });
}

var toVersion = (obj) => {
  if(obj == null){
    return null;
  }
  var isArray = Array.isArray(obj);
  if(!isArray) obj = [obj];
  var output = [];
  for(let it=0; it<obj.length; it++){
    let version = new Version(obj[it]._id);
    version.update(obj[it]);
    output.push(version);
  }
  return isArray ? output : output[0];
}

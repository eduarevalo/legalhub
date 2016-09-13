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

var getVersion = (documentId, startDate, cb) => {
  db.find(collectionName, {
      documentId: new ObjectID(documentId),
      startDate: startDate,
      type: '$root',
	  rendition: 'editor'
    },
    versionFields,
    function(results){
      cb(toVersion(results));
    });
}

var getVersions = (documentId, cb) => {
  db.findSortLimit(collectionName, {
      documentId: new ObjectID(documentId),
      type: '$root',
	  rendition: 'editor'
    },
    versionFields,
    {
		startDate: -1
	},
    0,
    function(err, results){
      cb(err, toVersion(results));
    });
}

var getRenditions = (params, cb) => {
	var searchKeys = {type: '$root'};
	if(params.documentId){
		searchKeys.documentId = new ObjectID(params.documentId);
	}
	if(params.date){
		searchKeys.startDate = params.date;
	}
	db.findAll(collectionName, searchKeys,
	{ 
		_id: 1,
		rendition: 1
	},
	function(err, results){
		var versions = toVersion(results);
		if(versions && versions.length>0){
			cb(err, versions);
		}else{
			cb(err, null);
		}
	});
};

var getLastVersion = (params, cb) => {
	var searchKeys = {
		documentId: new ObjectID('' + params.documentId),
		type: '$root'
	};
	if(params.rendition){
		searchKeys.rendition = {
			$in: [params.rendition]
		};
	}else{
		searchKeys.rendition = {
			$in: ['editor', 'original']
		}
	}
	db.findSortLimit(collectionName, searchKeys,
	{ 
		_id: 1,
		documentId: 1,
		content: 1, 
		filePath: 1, 
		style: 1,
		schema: 1,
		startDate: 1
	},{
		startDate: -1
	},
	1,
	function(err, results){
		var versions = toVersion(results);
		if(versions.length>0){
			cb(err, versions[0]);
		}else{
			cb(err, null);
		}
	});
}

var getLinkedVersions = (documentId, linkType, cb) => {
  db.findSortLimit(collectionName, {
    type: '$root',
	rendition: 'editor',
	links: {
		$elemMatch: {
			type: linkType,
			idref: documentId
		}
	}
  },
  { 
	_id: 1,
	links: 1,
	documentId: 1,
	startDate:1,
	endDate:1,
	status:1,
	type:1
  },
  {startDate:-1},
  0,
  function(err, results){
	var versions = toVersion(results);
	if(versions.length>0){
		cb(err, versions);
	}else{
		cb(err, null);
	}
  });
};

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

exports.getVersion = getVersion;
exports.getVersions = getVersions;
exports.getRenditions = getRenditions;
exports.getLastVersion = getLastVersion;
exports.getLinkedVersions = getLinkedVersions;
"use strict";
// System dependencies
const fs = require('fs');

// Installed dependencies
const chance = require('chance').Chance();

// Project libraries
const configuration = require(__base + 'configuration');
var Collection = require(__base + 'model/collection/collection');
var collectionDao = require(__base + 'dao/collection/collectionDao');
var documentDao = require(__base + 'dao/document/documentDao');

const imageUtils = require(__base + 'core/utils/image'),
  pathUtils = require(__base + 'core/utils/path');

exports.search = (searchKeys, projectionKeys, cb) => {
  collectionDao.search(searchKeys, projectionKeys, cb);
}

exports.get = (id, callback) => {
  collectionDao.getCollectionById(id, function(err, collections){
    documentDao.getDocumentsCountByCollection(collections[0].id, function(err, count){
      collections.count = count;
      callback(err, collections[0]);
    });
  });
}

exports.save = (data, callback) => {
  let collection = new Collection();
  collection.update(data);
  if(collection.code == undefined){
    var pool = collection.title || collection.description;
    collection.code = chance.string({pool: pool.replace(/ /gi, ''), length: 6});
  }
  collectionDao.save(collection, function(err, results){
    if(results.result.nModified > 0 || (results.result.upserted && results.result.upserted.length > 0)){
      var saveAgain = false;
      if(results.result.upserted && results.result.upserted.length > 0 && results.result.upserted[0]._id){
        collection.id = results.result.upserted[0]._id;
        if(collection.qrCode == undefined || !fs.statSync(collection.qrCode)){
          var type = 'svg';
          var imgPath = pathUtils.join(pathUtils.getMediaFilePath({ext: type}));
          imageUtils.createQRCode(configuration.app.qrCodeDomainCollection + collection.id, type, imgPath);
          collection.qrCode = imgPath;
          saveAgain = true;
        }
        if(collection.icon == undefined || !fs.statSync(collection.icon)){
          var type = 'svg';
          var imgPath = pathUtils.join(pathUtils.getMediaFilePath({ext: type}));
          imageUtils.createIcon(configuration.app.qrCodeDomainCollection + collection.id, 200, imgPath);
          collection.icon = imgPath;
          saveAgain = true;
        }
      }
      if(saveAgain){
        collectionDao.save(collection, callback);
      }else{
        callback(err, collection);
      }
    }else{
      callback(err, results);
    }
  });
}

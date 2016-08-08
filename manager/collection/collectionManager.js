var chance = require('chance').Chance();
var Collection = require(__base + 'model/collection/collection');
var collectionDao = require(__base + 'dao/collection/collectionDao');
var documentDao = require(__base + 'dao/document/documentDao');
var imageUtils = require(__base + 'core/utils/image');

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
        if(collection.qrCode == undefined){
          var type = 'svg';
          var imgPath = 'media/generated/' + collection.id + '.' + type;
          var localPath = __base + 'view/' + imgPath;
          imageUtils.createQRCode("legalhub.vimmit.com/" + collection.id, type, localPath);
          collection.qrCode = imgPath;
          saveAgain = true;
        }
        if(collection.icon == undefined){
          var type = 'svg';
          var imgPath = 'media/generated/icon_' + collection.id + '.' + type;
          var localPath = __base + 'view/' + imgPath;
          imageUtils.createIcon("legalhub.vimmit.com/" + collection.id, 200, localPath);
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

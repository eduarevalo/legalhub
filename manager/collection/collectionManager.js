var Collection = require(__base + 'model/collection/collection');
var collectionDao = require(__base + 'dao/collection/collectionDao');

exports.get = (searchKeys, callback) => {
  collectionDao.search(new Collection(), callback);
}

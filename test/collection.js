global.__base = __dirname + '/../';

var assert = require('chai').assert;
var Collection = require(__base + 'model/collection/collection');
var collectionDao = require(__base + 'dao/collection/collectionDao');
var db = require(__base + 'core/db/db');

describe('Db', function() {
  describe('#connect()', function() {
    it('should connect without error', function(done) {
      db.connect(done);
    });
  });
});


describe('collectionDao', function() {
  describe('#save()', function() {
    it('should save without error', function(done) {
      var collection = new Collection(2, 'A48', 'Collection Testing A', 'My first collection');
      collectionDao.save(collection, function(err, result){
        if(err){
          throw err;
        }
        done();
      });
    });
  });
  describe('#getCollectionById()', function() {
    it('should get without error', function(done) {
      collectionDao.getCollectionById(1, function(collection){
        if(!collection){
          throw Error(`collection not found.`);
        }
        done();
      });
    });
  });
  describe('#getcollectionByCode()', function() {
    it('should get without error', function(done) {
      collectionDao.getCollectionByCode('A25', function(collection){
        if(!collection){
          throw Error(`collection not found.`);
        }
        done();
      });
    });
  });
  describe('#search()', function() {
    it('should search without error', function(done) {
      collectionDao.search(new Collection(), function(collections){
        assert.isAtLeast(collections.length, 1, `${collections.length} collections found.`);
        done();
      });
    });
  });
});

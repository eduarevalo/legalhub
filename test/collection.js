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
  describe('#drop()', function() {
    it('should drop without error', function(done) {
      collectionDao.drop(function(){
        done();
      });
    });
  });
  describe('#save()', function() {
    it('should save without error', function(done) {
      var collection = new Collection(0, 'A0', 'Collection Testing A0', 'My zero collection');
      collectionDao.save(collection, function(err, result){
        if(err){
          throw err;
        }
        done();
      });
    });
  });
  describe('#insert()', function() {
    it('should insert without error', function(done) {
      collectionDao.insert(require('./data/collections.json'), function(err, result){
        if(err){
          throw err;
        }
        done();
      });
    });
  });
  describe('#getCollectionById()', function() {
    it('should get without error', function(done) {
      collectionDao.getCollectionById(0, function(collection){
        if(!collection){
          throw Error(`collection not found.`);
        }
        done();
      });
    });
  });
  describe('#getcollectionByCode()', function() {
    it('should get without error', function(done) {
      collectionDao.getCollectionByCode('A0', function(collection){
        if(!collection){
          throw Error(`collection not found.`);
        }
        done();
      });
    });
  });
  describe('#search()', function() {
    it('should search without error', function(done) {
      collectionDao.search(new Collection(), {}, function(collections){
        assert.isAtLeast(collections.length, 1, `${collections.length} collections found.`);
        done();
      });
    });
  });
  describe('#count()', function() {
    it('should count without error', function(done) {
        collectionDao.count(new Collection(), function(count){
          console.log(`${count} collections found.`);
          assert.isAtLeast(count, 1, `${count} collections found.`);
          done();
        });
    });
  });
});

global.__base = __dirname + '/../';

var assert = require('chai').assert;
var Document = require(__base + 'model/document/document');
var documentDao = require(__base + 'dao/document/documentDao');
var db = require(__base + 'core/db/db');

describe('Db', function() {
  describe('#connect()', function() {
    it('should connect without error', function(done) {
      db.connect(done);
    });
  });
});


describe('DocumentDao', function() {
  describe('#save()', function() {
    it('should save without error', function(done) {
      var document = new Document(1, 'A1', 'Test A1');
      documentDao.save(document, function(err, result){
        if(err){
          throw err;
        }
        done();
      });
    });
  });
  describe('#insert()', function() {
    it('should insert without error', function(done) {

      documentDao.insert(require('./data/documents.json'), function(err, result){
        if(err){
          throw err;
        }
        done();
      });
    });
  });
  describe('#getDocumentById()', function() {
    it('should get without error', function(done) {
      documentDao.getDocumentById(1, function(document){
        if(!document){
          throw Error(`Document not found.`);
        }
        done();
      });
    });
  });
  describe('#getDocumentByEmail()', function() {
    it('should get without error', function(done) {
      documentDao.getDocumentByCode('A1', function(document){
        if(!document){
          throw Error(`Document not found.`);
        }
        done();
      });
    });
  });
  describe('#search()', function() {
    it('should search without error', function(done) {
      documentDao.search(new Document(), function(documents){
        assert.isAtLeast(documents.length, 1, `${documents.length} documents found.`);
        done();
      });
    });
  });
});

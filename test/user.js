global.__base = __dirname + '/../';

var assert = require('chai').assert;
var User = require(__base + 'model/user/user');
var userDao = require(__base + 'dao/user/userDao');
var db = require(__base + 'core/db/db');

describe('Db', function() {
  describe('#connect()', function() {
    it('should connect without error', function(done) {
      db.connect(done);
    });
  });
});


describe('UserDao', function() {
  describe('#save()', function() {
    it('should save without error', function(done) {
      var user = new User(2, 'arevalo_suarez@yahoo.com');
      userDao.save(user, function(err, result){
        if(err){
          throw err;
        }
        done();
      });
    });
  });
  describe('#getUserById()', function() {
    it('should get without error', function(done) {
      userDao.getUserById(1, function(user){
        if(!user){
          throw Error(`User not found.`);
        }
        done();
      });
    });
  });
  describe('#getUserByEmail()', function() {
    it('should get without error', function(done) {
      userDao.getUserByEmail('earevalosuarez@gmail.com', function(user){
        if(!user){
          throw Error(`User not found.`);
        }
        done();
      });
    });
  });
  describe('#search()', function() {
    it('should search without error', function(done) {
      userDao.search(new User(), function(users){
        assert.isAtLeast(users.length, 1, `${users.length} users found.`);
        done();
      });
    });
  });
});

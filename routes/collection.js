var express = require('express');
var router = express.Router();

var collectionManager = require(__base + 'manager/collection/collectionManager');

/* search */
router.get('/search', function (req, res) {
  var projectionModel = req.query['$projection'] ? req.query['$projection'].split(',') : [];
  delete req.query['$projection'];
  collectionManager.search(req.query, projectionModel, function(err, collections){
    res.json({success: true, data: collections});
  });
});
/* get */
router.get('/get/:id', function (req, res) {
  collectionManager.get(req.params.id, function(err, collection){
    res.json({success: true, data: collection});
  });
});
/* save */
router.post('/save', function (req, res) {
  collectionManager.save(req.body, function(err, collection){
    if(err){
      res.json({success: false, error: err});
    }else{
      res.json({success: true, code: collection.code, id: collection.id});
    }
  });
});

module.exports = router;

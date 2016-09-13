var express = require('express');
var fs    = require("fs");
var router = express.Router();

var documentManager = require(__base + 'manager/document/documentManager');

/* content */
router.get('/content', function (req, res) {
  documentManager.getLastVersion(req.query, function(err, version){
    if(err){
      res.json({success: false, error: err});
    }else{
      res.json({success: true, data: version});
    }
  });
});

router.get('/get', function (req, res) {
  documentManager.getVersions(req.query.id, function(err, versions){
    if(err){
      res.json({success: false, error: err});
    }else{
      res.json({success: true, data: versions});
    }
  });
});
module.exports = router;

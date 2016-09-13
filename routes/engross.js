var express = require('express');
var fs    = require("fs");
var router = express.Router();

var documentManager = require(__base + 'manager/document/documentManager');

/* preview */
router.get('/preview', function (req, res) {
  documentManager.getLastVersion(req.query.original, function(err, version){
    if(err){
      res.json({success: false, error: err});
    }else{
      res.json({success: true, data: version});
    }
  });
});

module.exports = router;

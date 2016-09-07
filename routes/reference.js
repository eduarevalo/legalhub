var express = require('express');
var fs    = require("fs");
var router = express.Router();

var referenceManager = require(__base + 'manager/reference/referenceManager');

/* getProvision */
router.get('/provision', function (req, res) {
  referenceManager.searchProvision(req.query, function(err, provisions){
	if(err){
		res.json({success: false, error: err});
    }else{
      res.json({success: true, data: provisions});
    }
  });
});

router.get('/properties', function (req, res) {
  referenceManager.searchProperties(req.query, function(err, provisions){
    if(err){
      res.json({success: false, error: err});
    }else{
      res.json({success: true, data: provisions});
    }
  });
});
module.exports = router;

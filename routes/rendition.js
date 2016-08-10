var express = require('express');
var fs    = require("fs");
var router = express.Router();

var renditionManager = require(__base + 'manager/rendition/renditionManager');

router.get('/get', function (req, res) {
  renditionManager.getRendition(req.query, function(err, filePath){
    if(err){
	  // Error 404
      res.json({success: false, error: err});
    }else{
      res.sendFile(filePath);
    }
  });
});
module.exports = router;

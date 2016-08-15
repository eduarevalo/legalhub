var express = require('express');
var fs    = require("fs");
var router = express.Router();

var renditionManager = require(__base + 'manager/rendition/renditionManager');

router.get('/get', function (req, res) {
  if(req.query.content){
	renditionManager.getRenditionFromContent(req.query.type, req.query.content, function(err, filePath){
		if(err){
		  // Error 404
		  res.json({success: false, error: err});
		}else{
		  res.sendFile(filePath);
		}
	  });
  }
  else{
	renditionManager.getRendition(req.query, function(err, filePath){
		if(err){
		  // Error 404
		  res.json({success: false, error: err});
		}else{
		  res.sendFile(filePath);
		}
	  });
	}
});

router.post('/generate', function (req, res) {
  if(req.body.content){
	renditionManager.getRenditionFromContent(req.body.type, req.body.content, function(err, filePath){
		if(err){
		  // Error 404
		  res.json({success: false, error: err});
		}else{
		  res.sendFile(filePath);
		}
	  });
  }
  else{
	renditionManager.getRendition(req.body, function(err, filePath){
		if(err){
		  // Error 404
		  res.json({success: false, error: err});
		}else{
		  res.sendFile(filePath);
		}
	  });
	}
});
module.exports = router;

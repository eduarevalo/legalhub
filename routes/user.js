var express = require('express');
var fs    = require("fs");
var router = express.Router();

var userManager = require(__base + 'manager/user/userManager');


/* sync */
router.get('/sync', function (req, res) {
  userManager.sync(function(err, results){
	if(err){
      res.json({success: false, error: err});
    }else{
      res.json({success: true, data: results});
    }
  });
});

/* search */
router.get('/search', function (req, res) {
  var projectionModel = req.query['$projection'] ? req.query['$projection'].split(',') : [];
  delete req.query['$projection'];
  userManager.search(req.query, projectionModel, function(err, users){
	if(err){
      res.json({success: false, error: err});
    }else{
      res.json({success: true, data: users});
    }
  });
});

/* login */
router.post('/login', function (req, res) {
	userManager.auth(req.body.username, req.body.password, function(result, user){
		if(result){
			user.token = 'legishub';
			res.json({success: true, data: user});
		}else{
			res.json({success: false});
		}
	});
});

/* register */
router.post('/register', function (req, res) {
  res.json({success: true, data: {}});
});


module.exports = router;

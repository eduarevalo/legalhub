var express = require('express');
var fs    = require("fs");
var router = express.Router();

/* login */
router.post('/login', function (req, res) {
var users = {
	'chantal': {
		name: 'chantal',
		firstName: 'Chantal',
		lastName: 'Lamarre'
	},
	'eduardo': {
		name: 'eduardo',
		firstName: 'Eduardo',
		lastName: 'Arevalo'
	},
	'pierre-samuel': {
		name: 'pierre-samuel',
		firstName: 'Pierre-Samuel',
		lastName: 'Dubé'
	},
	'sabrina': {
		name: 'sabrina',
		firstName: 'Sabrina',
		lastName: 'Vigneux'
	}
  };
  var userData = users[req.body.username];
  if(userData){
	userData.token = 'legishub';
	res.json({success: true, data: userData});
  }else{
	res.json({success: false});
  }
});

/* register */
router.post('/register', function (req, res) {
  res.json({success: true, data: {}});
});


module.exports = router;

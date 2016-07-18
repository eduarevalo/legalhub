global.__base = __dirname + '/';

var express = require('express');
var db = require(__base + 'core/db/db');
var configuration = require(__base + 'configuration');

/* manager imports */
var collectionManager = require(__base + 'manager/collection/collectionManager');

var app = express();

/* Client WEB Interface  */
app.use('/css', express.static('client/css'));
app.use('/data', express.static('client/data'));
app.use('/fonts', express.static('client/fonts'));
app.use('/img', express.static('client/img'));
app.use('/js', express.static('client/js'));
app.use('/media', express.static('client/media'));
app.use('/template', express.static('client/template'));
app.use('/vendors', express.static('client/vendors'));
app.use('/views', express.static('client/views'));

/* login.html */
app.get('/login', function (req, res) {
    res.sendFile( __dirname + '/client/login.html' );
});

/* API */
app.get('/api/collection', function (req, res) {
  collectionManager.get({}, function(collections){
    res.json(collections);
  });
});

/* index.html */
app.get('/*', function (req, res) {
    res.sendFile( __dirname + '/client/index.html' );
});

db.connect(function(){
	app.listen(configuration.server.port, function () {
  		console.log(`Application listening on port ${configuration.server.port}!`);
	});
});

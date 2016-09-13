global.__base = __dirname + '/';

var express = require('express');
var db = require(__base + 'core/db/db');
var configuration = require(__base + 'configuration');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');

var app = express();

app.use(busboy());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* Client WEB Interface  */
app.use('/data', express.static('data'));
app.use('/view', express.static('view'));

/* login.html */
app.get('/login', function (req, res) {
    res.sendFile( __dirname + '/view/login.html' );
});

/* API */
var api = require(__base + 'routes/api');
app.use('/api', api);

/* index.html */
app.get('/*', function (req, res) {
    res.sendFile( __dirname + '/view/index.html' );
});

db.connect(function(){
	app.listen(configuration.server.port, function () {
  		console.log(`Application listening on port ${configuration.server.port}!`);
	});
});

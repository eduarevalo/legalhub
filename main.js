global.__base = __dirname + '/';

process.stdout.write('\033c\n');
process.stdout.write(`░█─── █▀▀ █▀▀▀ ─▀─ █▀▀ ░█─░█ █──█ █▀▀▄\n`);
process.stdout.write(`░█─── █▀▀ █─▀█ ▀█▀ ▀▀█ ░█▀▀█ █──█ █▀▀▄\n`);
process.stdout.write(`░█▄▄█ ▀▀▀ ▀▀▀▀ ▀▀▀ ▀▀▀ ░█─░█ ─▀▀▀ ▀▀▀─\n`);
process.stdout.write(`                 ────by Irosoft Inc.──\n`);
process.stdout.write(` Starting...\n`);

var express = require('express');
var db = require(__base + 'core/db/db');
var configuration = require(__base + 'configuration');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(busboy());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* Static Folders  */
app.use('/data', express.static('data'));
app.use('/web-client', express.static('web-client'));

/* API */
var api = require(__base + 'routes/api');
app.use('/api', api);

/* Web Client Index */
app.get('/*', function (req, res) {
  res.sendFile( __dirname + '/web-client/index.html' );
});

db.connect(configuration.db[0].url, function(){
  process.stdout.write(` - Database connected!\n`);
});

server.listen(configuration.server.port, function () {
  process.stdout.write(` - Management Console started on port ${configuration.server.port}!\n`);
});


var users = [];

var usersData = {
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

io.on('connection', function (socket) {
	
	// Ack & Register
	socket.emit('ack', { id: socket.id });
	socket.on('register', function (data) {
		socket.emit('status', users);
		users.push({ name: data.username});
		socket.broadcast.emit('status', users);
	});	
	socket.on('subscribe', function(data){
		socket.join(data.room);
	});
	socket.on('unsubscribe', function(data){
		socket.leave(data.room);
	});
	socket.on('update', function(data) {
		if(data.document){
			socket.broadcast.to(data.document).emit('update', data);
		}
   });
	// Disconnect
	socket.on('disconnect', function() {
		var i = users.map(function(u) { return u.id; }).indexOf(socket.id);
		users.splice(i, 1);
		socket.broadcast.emit('status', users);
   });
   
});

process.on('uncaughtException', function (err) {
    console.log(err);
}); 
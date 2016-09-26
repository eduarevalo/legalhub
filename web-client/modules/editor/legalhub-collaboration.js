/*
	LEGALHUB Collaboration
*/

var legalHubCollaboration = function(updateCb){
	var self = this;
	this.socket;
	this.connectionId;
	this.updateCb = updateCb;
	this.connect = function(api, username, cb){
		self.socket = io(api);
		self.socket.on('ack', function (data) {
			self.connectionId = data.id
			self.socket.emit('register', { id: self.connectionId, username: username });
			if(cb){
				cb();
			}
		});
		self.socket.on('status', self.updateCb);
		self.socket.on('update', function(data){
			document.getElementById(data.data.id).innerHTML = data.data.html;
		});
	}
	this.isConnected = function(){
		return self.socket && self.socket.connected;
	}
	this.disconnect = function(){
		self.socket.disconnect();
		self.socket = null;
	}
	this.openDocument = function(id){
		self.socket.emit("subscribe", { room: id });
	}
	this.updateDocument = function(id, data){
		self.socket.emit('update', {document: id, data: data});
	}
}

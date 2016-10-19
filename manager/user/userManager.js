"use strict";
// System dependencies

// Installed dependencies
const ldap = require('ldapjs');

// Project libraries
const configuration = require(__base + 'configuration');
var User = require(__base + 'model/user/user');
const userDao = require(__base + 'dao/user/userDao');

var get = (id, cb) => {
  userDao.getUserById(id, cb);
}

var auth = (email, pass, cb) => {
	userDao.getUserByEmail(email, function(err, user){
	
		if(user.ldapDN){
			var client = ldap.createClient({
				url: configuration.modules.authentication.provider.params["url"]
			});
		
			client.bind( user.ldapDN, pass, function(err) {
				if (err) {
					// Invalid credentials / user not found are not errors but login failures
					if (err.name === 'InvalidCredentialsError' || err.name === 'NoSuchObjectError' ||
						(typeof err === 'string' && err.match(/no such user/i))) {
						cb(false);
					}else{
						// Other errors are (most likely) real errors
						cb(false);
					}
				}else{
					cb(true, user);
				}
			});
			
		}else if(user.password == pass){
			cb(true, user);
		}else{
			cb(false);
		}
	});
}

var sync = (cb) => {
	var client = ldap.createClient({
	  url: configuration.modules.authentication.provider.params["url"]
	});
	client.bind( configuration.modules.authentication.provider.params["user"], configuration.modules.authentication.provider.params["password"], function(err) {
		
		if (err) {
            // Invalid credentials / user not found are not errors but login failures
            if (err.name === 'InvalidCredentialsError' || err.name === 'NoSuchObjectError' ||
                (typeof err === 'string' && err.match(/no such user/i))) {
                cb('Invalid username/password');
            }else{
				// Other errors are (most likely) real errors
				cb(err);
			}
        }
		var users = [];
		var opts = {
			  filter: configuration.modules.authentication.provider.params["filter"],
			  scope: configuration.modules.authentication.provider.params["scope"],
			  /*paging: true,
			  sizeLimit: 200*/
		};
		
		client.search(configuration.modules.authentication.provider.params["userSearchDn"], opts, function(err, res) {
			
			res.on('searchEntry', function(entry) {
				// do per-entry processing
				if(entry.object.sAMAccountName 
					&& entry.object.distinguishedName 
						&& entry.object.distinguishedName.indexOf('_disable') == -1 
							&& entry.object.distinguishedName.indexOf('OU=dev') == -1){
					
					var obj = new User();
					obj.firstName = entry.object.givenName;
					obj.lastName = entry.object.sn;	
					obj.email = entry.object.mail;
					obj.ldapDN = entry.object.distinguishedName;
					users.push(obj);
				}
			  });
			  /*res.on('page', function(result) {
				console.log('page end');
			  });*/
			  res.on('error', function(err) {
				cb(err);
			  });
			  res.on('end', function(result) {
				userDao.insert(users, cb);
			  });

		});
		
	});
}

var search = (data, projection, cb) => {
	userDao.search(data, projection, cb);
}

var save = (user, cb) => {
	userDao.search(user, {}, cb);
}

exports.get = get;
exports.auth = auth;
exports.search = search;
exports.save = save;
exports.sync = sync;
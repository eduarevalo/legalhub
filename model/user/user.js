"use strict";
var Model = require(__base + 'model/model');

module.exports = class User extends Model{
  constructor(id) {
	super();
    this.id = id;
	this.firstName = undefined;
	this.lastName = undefined;
    this.email = undefined;
    this.password = undefined;
    this.avatar = undefined;
	this.ldapDN = undefined;
  }
  toString() {
    return `${this.id} ${this.email}`;
  }
}

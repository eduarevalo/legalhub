"use strict";

var Model = require(__base + 'model/model');

module.exports = class Fragment extends Model{
  constructor(id) {
    super();
    this.id = id;
    this.documentId = undefined;
    this.type = undefined;
    this.startDate = undefined;
    this.endDate = undefined;
    this.content = undefined;
	this.filePath = undefined;
    this.status = undefined;
    this.tags = undefined;
    this.permissions = undefined;
    this.properties = undefined;
	this.rendition = undefined;
	this.renditionName = undefined;
  }
  toString() {
    return `${this.id} []${this.type}] ${this.startDate}`;
  }
}

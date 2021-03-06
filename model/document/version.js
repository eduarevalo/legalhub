"use strict"; 

var Model = require(__base + 'model/model');

module.exports = class Version extends Model{
  constructor(id) {
    super();
    this.fragmentId = id;
    this.documentId = undefined;
    this.startDate = undefined;
    this.endDate = undefined;
    this.status = undefined;
    this.type = undefined;
    this.content = undefined;
	this.filePath = undefined;
	this.schema = undefined;
	this.style = undefined;
	this.links = undefined;
	this.rendition = undefined;
  }
  toString() {
    return `${this.fragmentId} [${this.documentId}] ${this.startDate}`;
  }
}

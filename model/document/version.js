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
  }
  toString() {
    return `${this.fragmentId} []${this.documentId}] ${this.startDate}`;
  }
}

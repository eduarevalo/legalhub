"use strict"; 
var Model = require(__base + 'model/model');

module.exports = class Collection extends Model {
  constructor(id) {
    super();
    this.id = id;
    this.code = undefined;
    this.title = undefined;
    this.description = undefined;
    this.color = undefined;
    this.icon = undefined;
    this.count = undefined;
    this.classifier = undefined;
    this.public = undefined;
    this.allowedTypes = undefined;
  }

  toString() {
    return `${this.id} ${this.code}`;
  }
}

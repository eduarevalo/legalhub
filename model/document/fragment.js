"use strict"; 

var Model = require(__base + 'model/model');

module.exports = class Fragment extends Model{
  constructor(id) {
    super();
    this.id = id;
    this.type = undefined;
    this.startDate = undefined;
    this.endDate = undefined;
    this.content = undefined;
    this.status = undefined;
    this.tags = undefined;
    this.permissions = undefined;
    this.properties = undefined;
  }
  toString() {
    return `${this.id} []${this.type}] ${this.startDate}`;
  }
}

"use strict"; 

var Parser = require(__base + 'manager/parser/parser');

module.exports = class xmlParser extends Parser{
  constructor(id, xmlns) {
	super(id);
	this.xmlns = xmlns;
    this.schemaLocation = '';
  }
}

"use strict";
var Model = require(__base + 'model/model');

module.exports = class Document extends Model{
  constructor(id) {
    super();
    this.id = id;
    this.code = undefined;
    this.title = undefined;
	this.longTitle = undefined;
    this.description = undefined;
    this.documentType = undefined;
    this.lastModificationDate = undefined;
	this.creationDate = undefined;
    this.template = undefined;
    this.owner = undefined;
    this.collections = undefined;
    this.qrCode = undefined;
  }
  setCollection(collectionId){
    if(this.collections === undefined){
      this.collections = [];
    }
    if(this.collections.indexOf(collectionId)<0){
      this.collections.push(collectionId);
    }
  }
  toString() {
    return `${this.id} []${this.code}] ${this.title}`;
  }
}

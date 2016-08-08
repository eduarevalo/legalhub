"use strict"; 
module.exports = class Model{
  update(obj){
    for (var prop in this) {
      if((typeof this[prop] === "undefined" || this[prop]) && obj[prop]){
        if(obj[prop] == "true" || obj[prop] == "false"){
          this[prop] = obj[prop] == "true";
        }
        this[prop] = obj[prop];
      }
    }
  }
  toObject(){
    var obj = {};
    for(var prop in this){
      if(this[prop] !== undefined){
        obj[prop] = this[prop];
      }
    }
    return obj;
  }
}

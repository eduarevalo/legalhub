module.exports = class Document {
  constructor(id, code, title, properties, schema, parts) {
    properties = properties || {};
    parts = parts || {
      "__root": [{
        start: new Date(),
        end: null,
        content: ""
      }]
    };
    this.id = id;
    this.code = code;
    this.title = title;
    this.properties = properties;
    this.schema = schema;
    this.parts = parts;
  }

  /*setAuthor(author) {
    this.properties["author"] = author;
  }

  setDescription(description){
    this.properties["description"] = description;
  }

  setContent(id, datetime, content){
    this.parts[id].push({
      start: datetime,
      end: null,
      content: content
    });
  }*/

  toString() {
    return `${this.id} []${this.code}] ${this.title}`;
  }
}

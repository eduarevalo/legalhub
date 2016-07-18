module.exports = class Collection {
  constructor(id, code, title, description) {
    this.id = id;
    this.code = code;
    this.title = title;
    this.description = description;
  }

  toString() {
    return `${this.id} ${this.code}`;
  }
}

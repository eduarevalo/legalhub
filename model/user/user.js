module.exports = class User {
  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.avatar = null;
  }

  /*get id() {
    return this.id;
  }

  get email() {
    return this.email;
  }

  get password(){
    return this.password;
  }

  get avatar(){
    return this.avatar;
  }*/

  toString() {
    return `${this.id} ${this.email}`;
  }
}

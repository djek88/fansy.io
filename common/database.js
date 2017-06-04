const mysql = require('mysql');
const config = require('../config');

class Database {
  constructor() {
    this.getConnection();
  }

  getConnection() {
    this.conn = mysql.createPool({
      host: config.database.host,
      user: config.database.login,
      password: config.database.password,
      database: config.database.dbName
    });
  }
}

module.exports = new Database();

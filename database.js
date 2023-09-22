const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./scoreboard.db');

db.run("CREATE TABLE IF NOT EXISTS scores (name TEXT, score INTEGER)");

module.exports = db;

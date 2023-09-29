const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./scoreboard.db');

db.run(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    score INTEGER,
    wins INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    total_goals INTEGER DEFAULT 0
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_id INTEGER,
    player2_id INTEGER,
    player1_score INTEGER,
    player2_score INTEGER,
    date TEXT,
    FOREIGN KEY(player1_id) REFERENCES scores(id),
    FOREIGN KEY(player2_id) REFERENCES scores(id)
  )
`);

db.all("PRAGMA table_info(scores)", [], (err, columns) => {
  if (err) throw err;

  const columnNames = columns.map(col => col.name);

  if (!columnNames.includes('wins')) {
    db.run(`ALTER TABLE scores ADD COLUMN wins INTEGER DEFAULT 0`);
  }

  if (!columnNames.includes('losses')) {
    db.run(`ALTER TABLE scores ADD COLUMN losses INTEGER DEFAULT 0`);
  }

  if (!columnNames.includes('draws')) {
    db.run(`ALTER TABLE scores ADD COLUMN draws INTEGER DEFAULT 0`);
  }

  if (!columnNames.includes('points')) {
    db.run(`ALTER TABLE scores ADD COLUMN points INTEGER DEFAULT 0`);
  }

  if (!columnNames.includes('games_played')) {
    db.run(`ALTER TABLE scores ADD COLUMN games_played INTEGER DEFAULT 0`);
  }

  if (!columnNames.includes('total_goals')) {
    db.run(`ALTER TABLE scores ADD COLUMN total_goals INTEGER DEFAULT 0`);
  }
});

module.exports = db;

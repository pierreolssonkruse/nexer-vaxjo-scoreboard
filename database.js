const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./scoreboard.db');

db.run(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    score INTEGER
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
`, function (err) {
  if (err) throw err;

  db.run(`
    ALTER TABLE scores ADD COLUMN wins INTEGER DEFAULT 0
  `);
  db.run(`
    ALTER TABLE scores ADD COLUMN games_played INTEGER DEFAULT 0
  `);
  db.run(`
    ALTER TABLE scores ADD COLUMN total_goals INTEGER DEFAULT 0
  `);
});

module.exports = db;

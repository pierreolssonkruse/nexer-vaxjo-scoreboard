const pgp = require('pg-promise')();

const connectionString = process.env.REACT_APP_DATABASE_URL;
const db = pgp(connectionString);

db.one("SHOW max_connections;")
  .then(result => {
    console.log("Max Connections:", result.max_connections);
  })
  .catch(error => {
    console.error("Error fetching max connections:", error);
  });

const createScoresTable = () => {
  return db.none(`
        CREATE TABLE IF NOT EXISTS scores (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE,
            score INTEGER,
            wins INTEGER DEFAULT 0,
            games_played INTEGER DEFAULT 0,
            total_goals INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            draws INTEGER DEFAULT 0,
            points INTEGER DEFAULT 0,
            goals_conceded INTEGER DEFAULT 0
        )
    `);
};

const createGamesTable = () => {
  return db.none(`
        CREATE TABLE IF NOT EXISTS games (
            id SERIAL PRIMARY KEY,
            player1_id INTEGER,
            player2_id INTEGER,
            player1_score INTEGER,
            player2_score INTEGER,
            date TEXT,
            FOREIGN KEY(player1_id) REFERENCES scores(id),
            FOREIGN KEY(player2_id) REFERENCES scores(id)
        )
    `);
};

const addColumnIfNotExists = (tableName, columnName, columnDefinition) => {
  return db.none(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`)
    .catch(error => {
      if (!error.message.includes('column') || !error.message.includes('already exists')) {
        throw error;
      }
    });
};

createScoresTable()
  .then(createGamesTable)
  .then(() => addColumnIfNotExists('scores', 'wins', 'INTEGER DEFAULT 0'))
  .then(() => addColumnIfNotExists('scores', 'losses', 'INTEGER DEFAULT 0'))
  .then(() => addColumnIfNotExists('scores', 'draws', 'INTEGER DEFAULT 0'))
  .then(() => addColumnIfNotExists('scores', 'points', 'INTEGER DEFAULT 0'))
  .then(() => addColumnIfNotExists('scores', 'games_played', 'INTEGER DEFAULT 0'))
  .then(() => addColumnIfNotExists('scores', 'total_goals', 'INTEGER DEFAULT 0'))
  .then(() => addColumnIfNotExists('scores', 'goals_conceded', 'INTEGER DEFAULT 0'))
  .catch(error => {
    console.error("Error during database initialization:", error);
  });

module.exports = db;

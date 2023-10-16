const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.REACT_APP_DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 500,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', async (client) => {
  console.log('Connected to the database');
  try {
    await client.query("SET idle_in_transaction_session_timeout = '1s';");
    console.log('Set idle_in_transaction_session_timeout to 1 second');
  } catch (error) {
    console.error('Error setting idle_in_transaction_session_timeout:', error);
  }
});

pool.on('acquire', (client) => {
  console.log('Client checked out from the pool');
});

pool.on('remove', (client) => {
  console.log('Client checked back into the pool');
});

const myDatabaseQuery = async (queryText, values) => {
  try {
    const res = await pool.query({ text: queryText, values: values });
    return res.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

const createScoresTable = async () => {
  console.log('About to create scores table...');
  try {
    await myDatabaseQuery(`
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
    console.log('Scores table creation complete.');
  } catch (error) {
    console.error('Error during scores table creation:', error);
  }
};

const createGamesTable = async () => {
  try {
    await myDatabaseQuery(`
      CREATE TABLE IF NOT EXISTS games (
          id SERIAL PRIMARY KEY,
          player1_id INTEGER,
          player2_id INTEGER,
          player1_score INTEGER,
          player2_score INTEGER,
          date TEXT,
          FOREIGN KEY(player1_id) REFERENCES scores(id) ON DELETE CASCADE,
          FOREIGN KEY(player2_id) REFERENCES scores(id) ON DELETE CASCADE
      )
    `);
  } catch (error) {
    console.error('Error during games table creation:', error);
  }
};

const alterTableQuery = `
  ALTER TABLE scores
  ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS draws INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS games_played INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_goals INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS goals_conceded INTEGER DEFAULT 0;
`;

const initializeDatabase = async () => {
  try {
    await createScoresTable();
    await createGamesTable();
    await myDatabaseQuery(alterTableQuery);
  } catch (error) {
    console.error("Error during database initialization:", error);
  }
};

module.exports = {
  myDatabaseQuery,
  initializeDatabase
};

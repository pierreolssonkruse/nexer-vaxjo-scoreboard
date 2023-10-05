require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

app.get('/scores', async (req, res) => {
  try {
    const rows = await db.any('SELECT * FROM scores ORDER BY score DESC');
    return res.json({ data: rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/rankings', async (req, res) => {
  try {
    const query = `
    SELECT *
    FROM scores
    ORDER BY points DESC, games_played DESC, total_goals DESC, name ASC
`;
    const rows = await db.any(query);
    return res.json({ data: rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/gameResults', async (req, res) => {
  try {
    const query = `
      SELECT g.id, g.date, 
             p1.name as player1_name, g.player1_score,
             p2.name as player2_name, g.player2_score
      FROM games g
      JOIN scores p1 ON g.player1_id = p1.id
      JOIN scores p2 ON g.player2_id = p2.id
      ORDER BY g.date DESC
    `;

    const rows = await db.any(query);
    const formattedData = rows.map(row => ({
      date: row.date,
      scores: [
        { name: row.player1_name, score: row.player1_score },
        { name: row.player2_name, score: row.player2_score }
      ]
    }));
    return res.json({ data: formattedData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/scores', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ "error": "Player name is required" });
  }
  try {
    const result = await db.one('INSERT INTO scores (name) VALUES ($1) RETURNING id', [name]);
    return res.json({ "player_id": result.id });
  } catch (err) {
    return res.status(400).json({ "error": err.message });
  }
});

app.post('/gameResult', async (req, res) => {
  const { player1_id, player2_id, player1_score, player2_score } = req.body;
  if (!player1_id || !player2_id || player1_score === undefined || player2_score === undefined) {
    return res.status(400).json({ error: "Incomplete game data" });
  }

  const currentDate = new Date().toISOString().slice(0, 10);
  const sql = `
    INSERT INTO games (player1_id, player2_id, player1_score, player2_score, date)
    VALUES ($1, $2, $3, $4, $5) RETURNING id
  `;

  let player1Updates = {
    games_played: 1,
    total_goals: player1_score,
    goals_conceded: player2_score,
    points: 0
  };

  let player2Updates = {
    games_played: 1,
    total_goals: player2_score,
    goals_conceded: player1_score,
    points: 0
  };

  if (player1_score > player2_score) {
    player1Updates.wins = 1;
    player1Updates.points = 3;
    player2Updates.losses = 1;
  } else if (player1_score < player2_score) {
    player1Updates.losses = 1;
    player2Updates.wins = 1;
    player2Updates.points = 3;
  } else {
    player1Updates.draws = 1;
    player2Updates.draws = 1;
    player1Updates.points = 1;
    player2Updates.points = 1;
  }

  try {
    await db.one(sql, [player1_id, player2_id, player1_score, player2_score, currentDate]);

    await db.none(`
      UPDATE scores 
      SET 
          wins = wins + $1,
          losses = losses + $2,
          draws = draws + $3,
          games_played = games_played + $4,
          total_goals = total_goals + $5,
          goals_conceded = goals_conceded + $6,
          points = points + $7
      WHERE id = $8
    `, [
      player1Updates.wins || 0,
      player1Updates.losses || 0,
      player1Updates.draws || 0,
      player1Updates.games_played,
      player1Updates.total_goals,
      player1Updates.goals_conceded,
      player1Updates.points,
      player1_id
    ]);

    await db.none(`
      UPDATE scores 
      SET 
          wins = wins + $1,
          losses = losses + $2,
          draws = draws + $3,
          games_played = games_played + $4,
          total_goals = total_goals + $5,
          goals_conceded = goals_conceded + $6,
          points = points + $7
      WHERE id = $8
    `, [
      player2Updates.wins || 0,
      player2Updates.losses || 0,
      player2Updates.draws || 0,
      player2Updates.games_played,
      player2Updates.total_goals,
      player2Updates.goals_conceded,
      player2Updates.points,
      player2_id
    ]);

    return res.json({ message: "Game result recorded and scores updated." });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.put('/scores/:name', async (req, res) => {
  const playerName = req.params.name;
  const { score } = req.body;
  try {
    await db.none('UPDATE scores SET score = $1 WHERE name = $2', [score, playerName]);
    return res.json({ "message": "score updated" });
  } catch (err) {
    return res.status(400).json({ "error": err.message });
  }
});

app.delete('/scores/:id', async (req, res) => {
  try {
    await db.none('DELETE FROM scores WHERE id = $1', [req.params.id]);
    return res.json({ "message": "deleted" });
  } catch (err) {
    return res.status(400).json({ "error": err.message });
  }
});

app.put('/scores/:id', async (req, res) => {
  const { id } = req.params;
  const { wins = 0, games_played = 0, total_goals = 0 } = req.body;

  const query = `
    UPDATE scores 
    SET 
        wins = wins + $1, 
        games_played = games_played + $2, 
        total_goals = total_goals + $3
    WHERE id = $4
  `;

  try {
    await db.none(query, [wins, games_played, total_goals, id]);
    return res.json({ message: 'Player stats updated successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update player stats.' });
  }
});

app.put('/resetStats', async (req, res) => {
  try {
    await db.none(`
      UPDATE scores 
      SET 
          score = 0,
          wins = 0,
          games_played = 0,
          total_goals = 0,
          losses = 0,
          draws = 0,
          points = 0,
          goals_conceded = 0
    `);
    return res.json({ message: 'Player stats reset successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reset player stats.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

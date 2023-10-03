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
    SELECT *,
    (3 * wins + games_played - (wins + losses)) AS calculated_points
    FROM scores
    ORDER BY calculated_points DESC, total_goals DESC, wins DESC
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

  try {
    const gameResult = await db.one(sql, [player1_id, player2_id, player1_score, player2_score, currentDate]);

    return res.json({ game_id: gameResult.id });
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

app.get('/scores', (req, res) => {
  db.all(`SELECT * FROM scores ORDER BY score DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ data: rows });
  });
});

app.get('/rankings', (req, res) => {
  const query = `
    SELECT * FROM scores
    ORDER BY (wins / games_played) DESC, total_goals DESC, wins DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ data: rows });
  });
});

app.get('/gameResults', (req, res) => {
  const query = `
      SELECT g.id, g.date, 
             p1.name as player1_name, g.player1_score,
             p2.name as player2_name, g.player2_score
      FROM games g
      JOIN scores p1 ON g.player1_id = p1.id
      JOIN scores p2 ON g.player2_id = p2.id
      ORDER BY g.date DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const formattedData = rows.map(row => {
      return {
        date: row.date,
        scores: [
          { name: row.player1_name, score: row.player1_score },
          { name: row.player2_name, score: row.player2_score }
        ]
      }
    });
    return res.json({ data: formattedData });
  });
});

app.post('/scores', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ "error": "Player name is required" });
  }
  const sql = 'INSERT INTO scores (name, score, wins, games_played, total_goals) VALUES (?, 0, 0, 0, 0)';
  db.run(sql, name, function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({ "player_id": this.lastID });
  });
});

app.post('/gameResult', (req, res) => {
  const { player1_id, player2_id, player1_score, player2_score } = req.body;

  if (!player1_id || !player2_id || player1_score === undefined || player2_score === undefined) {
    return res.status(400).json({ error: "Incomplete game data" });
  }

  const currentDate = new Date().toISOString().slice(0, 10);

  const sql = `
    INSERT INTO games (player1_id, player2_id, player1_score, player2_score, date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [player1_id, player2_id, player1_score, player2_score, currentDate], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    const gameId = this.lastID;
    let isDraw = false;

    if (player1_score > player2_score) {
      db.run(
        `UPDATE scores SET wins = wins + 1, games_played = games_played + 1, total_goals = total_goals + ?, points = points + 3 WHERE id = ?`,
        [player1_score, player1_id]
      );
      db.run(
        `UPDATE scores SET losses = losses + 1, games_played = games_played + 1, total_goals = total_goals + ? WHERE id = ?`,
        [player2_score, player2_id]
      );
    } else if (player1_score < player2_score) {
      db.run(
        `UPDATE scores SET wins = wins + 1, games_played = games_played + 1, total_goals = total_goals + ?, points = points + 3 WHERE id = ?`,
        [player2_score, player2_id]
      );
      db.run(
        `UPDATE scores SET losses = losses + 1, games_played = games_played + 1, total_goals = total_goals + ? WHERE id = ?`,
        [player1_score, player1_id]
      );
    } else {
      isDraw = true;
      db.run(
        `UPDATE scores SET draws = draws + 1, games_played = games_played + 1, total_goals = total_goals + ?, points = points + 1 WHERE id = ?`,
        [player1_score, player1_id]
      );
      db.run(
        `UPDATE scores SET draws = draws + 1, games_played = games_played + 1, total_goals = total_goals + ?, points = points + 1 WHERE id = ?`,
        [player2_score, player2_id]
      );
    }

    res.json({ game_id: gameId });
  });
});


app.put('/scores/:name', (req, res) => {
  const playerName = req.params.name;
  const { score } = req.body;
  db.run("UPDATE scores SET score = ? WHERE name = ?", [score, playerName], function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({ "message": "score updated" });
  });
});

app.delete('/scores/:id', (req, res) => {
  const sql = 'DELETE FROM scores WHERE id = ?';
  db.run(sql, req.params.id, function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({ "message": "deleted", changes: this.changes });
  });
});

app.put('/scores/:id', (req, res) => {
  const { id } = req.params;
  const { wins = 0, games_played = 0, total_goals = 0 } = req.body;

  const query = `
      UPDATE scores 
      SET 
          wins = wins + ?, 
          games_played = games_played + ?, 
          total_goals = total_goals + ?
      WHERE id = ?
  `;

  db.run(query, [wins, games_played, total_goals, id], (err) => {
    if (err) {
      res.status(500).send({ error: 'Failed to update player stats.' });
      return;
    }
    res.send({ message: 'Player stats updated successfully.' });
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

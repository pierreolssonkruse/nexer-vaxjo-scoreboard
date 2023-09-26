const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(cors());

app.get('/scores', (req, res) => {
  db.all(`SELECT * FROM scores ORDER BY score DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ data: rows });
  });
});

app.post('/score', (req, res) => {
  const { name, score, history } = req.body;
  db.run("INSERT INTO scores (name, score) VALUES (?, ?)", [name, score], function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({ "id": this.lastID });
  });
});

app.put('/score/:name', (req, res) => {
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

app.delete('/score/:id', (req, res) => {
  const sql = 'DELETE FROM scores WHERE id = ?';
  db.run(sql, req.params.id, function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({ "message": "deleted", changes: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const db = require('../../database');

exports.handler = async (event, context) => {
  const { id } = event.queryStringParameters;
  const { wins = 0, games_played = 0, total_goals = 0 } = JSON.parse(event.body);
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
};

const db = require('../../database');

exports.handler = async (event, context) => {
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
};

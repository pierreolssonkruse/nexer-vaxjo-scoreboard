const db = require('../../database');

exports.handler = async (event, context) => {
  const { player1_id, player2_id, player1_score, player2_score } = JSON.parse(event.body);
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
};

const db = require('../../database');

exports.handler = async (event, context) => {
  const { name } = JSON.parse(event.body);

  if (!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ "error": "Player name is required" })
    };
  }

  try {
    const result = await db.one('INSERT INTO scores (name) VALUES ($1) RETURNING id', [name]);
    return {
      statusCode: 200,
      body: JSON.stringify({ "player_id": result.id })
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ "error": err.message })
    };
  }
};

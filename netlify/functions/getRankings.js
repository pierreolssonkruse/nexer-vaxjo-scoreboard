const db = require('../../database');

exports.handler = async (event, context) => {
  try {
    const query = `
        SELECT *
        FROM scores
        ORDER BY points DESC, games_played DESC, total_goals DESC, name ASC
        `;
    const rows = await db.any(query);
    return {
      statusCode: 200,
      body: JSON.stringify({ data: rows })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

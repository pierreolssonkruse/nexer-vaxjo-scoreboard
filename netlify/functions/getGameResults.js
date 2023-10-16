const { myDatabaseQuery } = require('../../database');
console.log(myDatabaseQuery, 'myDatabaseQuery');

exports.handler = async (event, context) => {
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

    const rows = await myDatabaseQuery(query);
    const formattedData = rows.map(row => ({
      date: row.date,
      scores: [
        { name: row.player1_name, score: row.player1_score },
        { name: row.player2_name, score: row.player2_score }
      ]
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ data: formattedData })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}

const { myDatabaseQuery } = require('../../database');

exports.handler = async (event, context) => {
  const playerName = event.queryStringParameters.name;
  const { score } = JSON.parse(event.body);
  try {
    await myDatabaseQuery('UPDATE scores SET score = $1 WHERE name = $2', [score, playerName]);
    return res.json({ "message": "score updated" });
  } catch (err) {
    return res.status(400).json({ "error": err.message });
  }
}

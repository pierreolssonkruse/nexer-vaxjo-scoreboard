const db = require('../../database');

exports.handler = async (event, context) => {
  const id = event.queryStringParameters.id;
  try {
    await db.none('DELETE FROM scores WHERE id = $1', [req.params.id]);
    return res.json({ "message": "deleted" });
  } catch (err) {
    return res.status(400).json({ "error": err.message });
  }
};

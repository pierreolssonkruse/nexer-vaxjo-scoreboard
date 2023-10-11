const db = require('../../database');

exports.handler = async (event, context) => {
  const id = event.queryStringParameters.id;

  try {
    await db.none('DELETE FROM scores WHERE id = $1', [id]);
    return {
      statusCode: 200,
      body: JSON.stringify({ "message": "deleted" })
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ "error": err.message })
    };
  }
};

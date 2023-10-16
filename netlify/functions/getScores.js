const { myDatabaseQuery } = require('../../database');
console.log(myDatabaseQuery, 'myDatabaseQuery');

exports.handler = async (event, context) => {
  try {
    const rows = await myDatabaseQuery('SELECT * FROM scores ORDER BY score DESC');
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
}

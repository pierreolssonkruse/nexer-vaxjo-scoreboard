const db = require('../../database');

exports.handler = async (event, context) => {
  try {
    const result = await db.one('SELECT NOW() as now');
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error querying the database:', error);
    return {
      statusCode: 500,
      body: 'Error querying the database'
    };
  }
};

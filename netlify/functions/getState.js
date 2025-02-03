const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
});

exports.handler = async function(event, context) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { userId } = event.queryStringParameters;
  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing userId in query string' }),
    };
  }

  try {
    // Retrieve the document for this user via the index
    const doc = await client.query(
      q.Get(q.Match(q.Index("tracker_by_userId"), userId))
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ state: doc.data.state }),
    };
  } catch (error) {
    // If the document is not found, return an empty state instead of an error
    if (error.name === 'NotFound') {
      return {
        statusCode: 200,
        body: JSON.stringify({ state: {} }),
      };
    }
    console.error('Error retrieving state:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() }),
    };
  }
};
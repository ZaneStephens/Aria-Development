const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
});

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    const { userId } = event.queryStringParameters;
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId in query string' }),
      };
    }
    
    // Retrieve the document for this user from the "tracker" collection using the index.
    const doc = await client.query(
      q.Get(q.Match(q.Index("tracker_by_userId"), userId))
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({ state: doc.data.state }),
    };
  } catch (error) {
    console.error('Error retrieving state:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() }),
    };
  }
};

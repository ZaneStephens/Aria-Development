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
        body: JSON.stringify({ error: 'Missing userId' }),
      };
    }
    
    // Try to get the document for this user.
    const doc = await client.query(
      q.Get(q.Match(q.Index("tracker_by_userId"), userId))
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({ state: doc.data.state }),
    };
  } catch (error) {
    // If error is due to document not existing, return empty state.
    if (error.name === 'NotFound') {
      return {
        statusCode: 200,
        body: JSON.stringify({ state: {} }),
      };
    }
    console.error('Error retrieving state:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
const faunadb = require('faunadb');
const q = faunadb.query;

// Create a FaunaDB client using the secret from environment variables
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
});

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    const { userId, state } = JSON.parse(event.body);
    if (!userId || !state) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId or state in request body' }),
      };
    }
    
    // Check if a document for this user already exists using the "tracker_by_userId" index.
    const exists = await client.query(
      q.Exists(q.Match(q.Index("tracker_by_userId"), userId))
    );
    
    let doc;
    if (exists) {
      // Update the existing document.
      doc = await client.query(
        q.Update(
          q.Select("ref", q.Get(q.Match(q.Index("tracker_by_userId"), userId))),
          { data: { state } }
        )
      );
    } else {
      // Create a new document in the "tracker" collection.
      doc = await client.query(
        q.Create(q.Collection("tracker"), { data: { userId, state } })
      );
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'State saved successfully', doc }),
    };
  } catch (error) {
    console.error('Error saving state:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() }),
    };
  }
};

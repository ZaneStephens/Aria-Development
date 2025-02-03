const faunadb = require('faunadb');
const q = faunadb.query;

// Create a FaunaDB client using the secret stored in environment variables
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
});

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Ensure that the request body is present
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Request body is empty' })
    };
  }

  // Attempt to parse JSON from the request body
  let data;
  try {
    data = JSON.parse(event.body);
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body' })
    };
  }

  const { userId, state } = data;
  if (!userId || !state) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing userId or state in request body' })
    };
  }

  try {
    // Check if a document for this user already exists using the "tracker_by_userId" index
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
const { getStore } = require("@netlify/blobs");

exports.handler = async function (event) {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  
  try {
    const store = getStore({
      name: "child-tracker-store",
      siteID: process.env.NETLIFY_BLOBS_SITE_ID,
      token: process.env.NETLIFY_BLOBS_ACCESS_TOKEN
    });
    
    const data = await store.get("sharedDiary");
    if (!data) {
      return {
        statusCode: 200,
        body: JSON.stringify({ diary: [] }),
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ diary: JSON.parse(data) }),
    };
  } catch (error) {
    console.error("Error retrieving diary:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() }),
    };
  }
};
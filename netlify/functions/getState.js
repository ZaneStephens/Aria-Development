const { getStore } = require("@netlify/blobs");

exports.handler = async function (event) {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    console.log("Using Site ID:", process.env.NETLIFY_BLOBS_SITE_ID);
    console.log("Using Access Token:", process.env.NETLIFY_BLOBS_ACCESS_TOKEN ? "Exists ✅" : "Missing ❌");

    const store = getStore({
      name: "child-tracker-store",
      siteID: process.env.NETLIFY_BLOBS_SITE_ID,
      auth: { token: process.env.NETLIFY_BLOBS_ACCESS_TOKEN }
    });

    const data = await store.get("sharedState");
    if (!data) {
      return {
        statusCode: 200,
        body: JSON.stringify({ state: {} }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ state: JSON.parse(data) }),
    };
  } catch (error) {
    console.error("Error retrieving state:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() }),
    };
  }
};
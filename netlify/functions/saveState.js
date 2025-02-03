const { getStore } = require("@netlify/blobs");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (error) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { state } = data;
  if (!state) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing state data" }),
    };
  }

  try {
    console.log("Using Site ID:", process.env.NETLIFY_BLOBS_SITE_ID);
    console.log("Using Access Token:", process.env.NETLIFY_BLOBS_ACCESS_TOKEN ? "Exists ✅" : "Missing ❌");

    const store = getStore({
      name: "child-tracker-store",
      siteID: process.env.NETLIFY_BLOBS_SITE_ID,
      auth: { token: process.env.NETLIFY_BLOBS_ACCESS_TOKEN }
    });

    await store.set("sharedState", JSON.stringify(state));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "State saved successfully" }),
    };
  } catch (error) {
    console.error("Error saving state:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() }),
    };
  }
};
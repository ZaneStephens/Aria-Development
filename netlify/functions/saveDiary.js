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
  
  const { diaryEntries } = data;
  if (!diaryEntries) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing diary entries" }) };
  }
  
  try {
    const store = getStore({
      name: "child-tracker-store",
      siteID: process.env.NETLIFY_BLOBS_SITE_ID,
      token: process.env.NETLIFY_BLOBS_ACCESS_TOKEN
    });
    
    await store.set("sharedDiary", JSON.stringify(diaryEntries));
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Diary saved successfully" }),
    };
  } catch (error) {
    console.error("Error saving diary:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() }),
    };
  }
};
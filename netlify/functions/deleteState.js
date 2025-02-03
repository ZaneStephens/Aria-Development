const { getStore } = require("@netlify/blobs");

exports.handler = async function (event) {
    if (event.httpMethod !== "DELETE") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    let { userId } = event.queryStringParameters;
    
    // If no userId is provided, default to "defaultUser"
    if (!userId) {
        userId = "defaultUser"; 
    }

    try {
        console.log("Using Site ID:", process.env.NETLIFY_BLOBS_SITE_ID);
        console.log("Using Access Token:", process.env.NETLIFY_BLOBS_ACCESS_TOKEN ? "Exists ✅" : "Missing ❌");

        const store = getStore({
            name: "child-tracker-store",
            siteID: process.env.NETLIFY_BLOBS_SITE_ID,
            auth: { token: process.env.NETLIFY_BLOBS_ACCESS_TOKEN }
        });

        await store.delete(`user_${userId}`);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "State deleted successfully" }),
        };
    } catch (error) {
        console.error("Error deleting state:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.toString() }),
        };
    }
};
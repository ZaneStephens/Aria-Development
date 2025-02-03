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
        const store = getStore({
            name: "child-tracker-store",
            auth: { token: process.env.NETLIFY_PERSONAL_ACCESS_TOKEN }
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
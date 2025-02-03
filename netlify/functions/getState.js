const { getStore } = require("@netlify/blobs");

exports.handler = async function (event) {
    if (event.httpMethod !== "GET") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const store = getStore({
            name: "child-tracker-store",
            auth: { 
                token: process.env.NETLIFY_PERSONAL_ACCESS_TOKEN 
            }
        });

        const data = await store.get("sharedState"); // Use a shared key
        if (!data) {
            return {
                statusCode: 200,
                body: JSON.stringify({ state: {} }), // No saved state yet
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

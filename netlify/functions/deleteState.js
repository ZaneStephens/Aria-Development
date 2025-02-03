const { getStore } = require("@netlify/blobs");

exports.handler = async function (event) {
    if (event.httpMethod !== "DELETE") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { userId } = event.queryStringParameters;
    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing userId in query string" }),
        };
    }

    try {
        const store = getStore({ name: "child-tracker-store" });

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
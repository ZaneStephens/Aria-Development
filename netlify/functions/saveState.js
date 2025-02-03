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

    const { userId, state } = data;
    if (!userId || !state) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing userId or state" }),
        };
    }

    try {
        const store = getStore({
            name: "child-tracker-store",
            auth: { 
                token: process.env.NETLIFY_PERSONAL_ACCESS_TOKEN 
            }
        });

        await store.set(`user_${userId}`, JSON.stringify(state));

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
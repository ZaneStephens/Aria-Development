const fetch = require("node-fetch");

const kvURL = process.env.NETLIFY_KV_REST_API_URL;
const kvToken = process.env.NETLIFY_KV_REST_API_TOKEN;

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let data;
    try {
        data = JSON.parse(event.body);
    } catch (error) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { userId, state } = data;
    if (!userId || !state) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing userId or state' }),
        };
    }

    try {
        // Store in Netlify KV if available
        if (kvURL && kvToken) {
            const kvResponse = await fetch(`${kvURL}/child-tracker-${userId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${kvToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(state)
            });

            if (!kvResponse.ok) {
                throw new Error(`Netlify KV Storage failed: ${kvResponse.statusText}`);
            }

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "State saved successfully" }),
            };
        }

        // If KV Storage is unavailable, return a message
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Netlify KV Storage is not available. Enable KV Storage for persistent storage." })
        };

    } catch (error) {
        console.error('Error saving state:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.toString() }),
        };
    }
};
const fetch = require("node-fetch");

const kvURL = process.env.NETLIFY_KV_REST_API_URL;
const kvToken = process.env.NETLIFY_KV_REST_API_TOKEN;

exports.handler = async function (event) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { userId } = event.queryStringParameters;
    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing userId in query string' }),
        };
    }

    try {
        if (kvURL && kvToken) {
            const kvResponse = await fetch(`${kvURL}/child-tracker-${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${kvToken}`
                }
            });

            if (kvResponse.status === 404) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ state: {} }) // No saved state yet
                };
            }

            const storedData = await kvResponse.json();
            return {
                statusCode: 200,
                body: JSON.stringify({ state: storedData }),
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Netlify KV Storage is not available. Enable KV Storage for persistent storage." })
        };

    } catch (error) {
        console.error('Error retrieving state:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.toString() }),
        };
    }
};
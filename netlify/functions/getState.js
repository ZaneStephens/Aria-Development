const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../data.json');

exports.handler = async function(event) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { userId } = event.queryStringParameters;
    if (!userId) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing userId' }) };
    }

    try {
        if (!fs.existsSync(filePath)) {
            return { statusCode: 200, body: JSON.stringify({ state: {} }) };
        }

        const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const userState = existingData[userId] || {};

        return { statusCode: 200, body: JSON.stringify({ state: userState }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.toString() }) };
    }
};
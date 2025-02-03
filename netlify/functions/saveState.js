const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../data.json');

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let data;
    try {
        data = JSON.parse(event.body);
    } catch (error) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    try {
        let existingData = {};
        if (fs.existsSync(filePath)) {
            existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        existingData[data.userId] = data.state;

        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

        return { statusCode: 200, body: JSON.stringify({ message: 'State saved successfully' }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.toString() }) };
    }
};
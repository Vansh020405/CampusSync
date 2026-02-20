const fetch = require('node-fetch');

async function testApi() {
    try {
        console.log('Testing /api/faculty/list...');
        const res = await fetch('http://localhost:3000/api/faculty/list');
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Data type:', typeof data);
        console.log('Is Array:', Array.isArray(data));
        if (Array.isArray(data)) {
            console.log('Count:', data.length);
            if (data.length > 0) {
                console.log('First Item:', data[0]);
            }
        } else {
            console.log('Error Data:', data);
        }
    } catch (err) {
        console.error('API Test failed:', err.message);
        console.log('Make sure the dev server is running on port 3000');
    }
}

testApi();

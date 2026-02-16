const fetch = require('node-fetch');

async function checkApi() {
    try {
        const res = await fetch('http://localhost:3000/api/timetable?section=4G2', {
            headers: {
                'Cookie': 'next-auth.session-token=...' // I can't easily get this, but the API might be open for testing if I mock the session? No.
            }
        });
        // Actually, I'll just check the DB query directly in a script.
    } catch (e) { }
}

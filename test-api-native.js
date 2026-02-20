const http = require('http');

http.get('http://localhost:3000/api/faculty/list', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        try {
            const parsed = JSON.parse(data);
            console.log('Is Array:', Array.isArray(parsed));
            console.log('Count:', Array.isArray(parsed) ? parsed.length : 'N/A');
            if (Array.isArray(parsed) && parsed.length > 0) {
                console.log('Sample:', parsed[0]);
            } else {
                console.log('Raw:', data.substring(0, 500));
            }
        } catch (e) {
            console.log('Parse error:', e.message);
            console.log('Raw:', data.substring(0, 500));
        }
    });
}).on('error', (err) => {
    console.log('Error:', err.message);
});

const fs = require('fs');
const http = require('http');

const boundary = '---------boundary123';
const fileData = fs.readFileSync('test.pdf');

const data = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.pdf"\r\nContent-Type: application/pdf\r\n\r\n`),
    fileData,
    Buffer.from(`\r\n--${boundary}--\r\n`)
]);

const req = http.request('http://localhost:3000/api/resume/parse', {
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': data.length
    }
}, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => console.log('RESPONSE:', res.statusCode, body));
});

req.on('error', console.error);
req.write(data);
req.end();

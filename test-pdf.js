const fs = require('fs');
const http = require('http');

async function test() {
    console.log("Creating dummy PDF...");
    fs.writeFileSync('test.pdf', '%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%EOF\n');
    console.log("PDF created.");

    // Simple test of the pdf-parse library locally in Node without Next.js
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync('test.pdf');
    try {
        const data = await pdfParse(buffer);
        console.log("PDF-PARSE LOCAL: ", data.text.length);
    } catch (err) {
        console.log("PDF-PARSE LOCAL ERR: ", err.message);
    }

    console.log("Calling API endpoint...");
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fs.createReadStream('test.pdf'));

    const req = http.request('http://localhost:3000/api/resume/parse', {
        method: 'POST',
        headers: form.getHeaders()
    }, (res) => {
        let text = '';
        res.on('data', chunk => text += chunk);
        res.on('end', () => console.log(`API response ${res.statusCode}: `, text));
    });
    form.pipe(req);
}
test();

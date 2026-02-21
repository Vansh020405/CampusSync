const PDFParse = require('pdf-parse').PDFParse;

async function test() {
    const fs = require('fs');
    const buf = fs.readFileSync('test.pdf');
    try {
        const parser = new PDFParse();
        await parser.load(buf);
        const text = await parser.getText();
        console.log("Success!", text.substring(0, 100));
    } catch (e) {
        console.error("Error:", e);
    }
}
test();

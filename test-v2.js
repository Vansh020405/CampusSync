const pdfParseLib = require('pdf-parse');
const PDFParse = pdfParseLib.PDFParse || pdfParseLib.default || pdfParseLib;

async function test() {
    console.log(Object.keys(pdfParseLib));
    const fs = require('fs');
    const buf = fs.readFileSync('test.pdf');
    if (typeof PDFParse === 'function') {
        try {
            const parser = new PDFParse();
            const res = await parser.parse(buf);
            console.log("Success with class instantiation!", res.text.substring(0, 100));
        } catch (e) {
            console.log('Class err:', e.message);
            try {
                const res = await PDFParse(buf);
                console.log("Success with function call!", res.text.substring(0, 100));
            } catch (e2) {
                console.log('Func err:', e2.message);
            }
        }
    }
}
test();

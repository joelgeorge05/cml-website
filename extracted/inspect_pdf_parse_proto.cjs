const fs = require('fs');
const pdfParse = require('pdf-parse');

console.log('PDFParse type:', typeof pdfParse.PDFParse);
console.log('PDFParse keys', Object.keys(pdfParse.PDFParse.prototype));
console.log('is function?', typeof pdfParse.PDFParse === 'function');

(async () => {
  try {
    const buf = fs.readFileSync('Mekhala-Kala-Malsarangal-list-88-122.pdf');
    const pdf = new pdfParse.PDFParse(buf);
    console.log('pdf object keys', Object.keys(pdf));
    console.log('pdf getText type', typeof pdf.getText);
    console.log('pdf parse type', typeof pdf.parse);
    console.log('pdf getRawText type', typeof pdf.getRawText);
    console.log('pdf text type', typeof pdf.text);
  } catch (e) {
    console.error('err', e);
  }
})();

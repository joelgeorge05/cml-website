const fs = require('fs');
const pdfParse = require('pdf-parse');

(async () => {
  try {
    const buffer = fs.readFileSync('Mekhala-Kala-Malsarangal-list-88-122.pdf');
    console.log('pdfParse type', typeof pdfParse);
    console.log('pdfParse has keys', Object.keys(pdfParse));
    const result = await pdfParse(buffer);
    console.log('result type', typeof result);
    console.log('result keys', Object.keys(result));
    console.log('result.text type', typeof result.text);
    console.log('sample text length', result.text ? result.text.length : 'no text');
    console.log('first 200 chars:', result.text && result.text.slice(0,200));
  } catch (err) {
    console.error('error', err);
  }
})();

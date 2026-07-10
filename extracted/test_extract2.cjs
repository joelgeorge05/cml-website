const extractPdf = require('./extract_pdf2.cjs');
const fs = require('fs');
(async () => {
  const buf = fs.readFileSync('Mekhala-Kala-Malsarangal-list-88-122.pdf');
  try {
    const result = await extractPdf(buf);
    console.log('ok', typeof result.text, result.text.slice(0,200));
  } catch (e) {
    console.error('err', e);
  }
})();

const fs = require('fs');
const pdfParse = require('pdf-parse');

(async () => {
  try {
    const buf = fs.readFileSync('Mekhala-Kala-Malsarangal-list-88-122.pdf');
    const pdf = new pdfParse.PDFParse(new Uint8Array(buf));
    const text = await pdf.getText();
    console.log('text type', typeof text);
    console.log('text keys', Object.keys(text));
    console.log('text.pageCount', text.pageCount);
    console.log('text.itemsType', text.items && typeof text.items);
    console.log('text.firstItem', text.items && text.items[0]);
    console.log('text.str', text.str && text.str.slice(0,200));
  } catch (err) {
    console.error(err);
  }
})();

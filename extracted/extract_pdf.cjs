const { PDFParse } = require('pdf-parse');

async function extractPdf(buffer) {
  const pdf = new PDFParse(new Uint8Array(buffer));
  const result = await pdf.getText();
  return result; // has .text property
}

module.exports = extractPdf;

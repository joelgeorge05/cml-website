const { PDFParse } = require('pdf-parse');

async function extractPdf(buffer) {
  try {
    const pdf = new PDFParse(new Uint8Array(buffer));
    const data = await pdf.getText();
    const text = typeof data === 'string' ? data : (data && data.text) || '';
    return { text, success: true, raw: data };
  } catch (err) {
    console.error('PDF parsing error:', err);
    throw new Error(`Failed to parse PDF: ${err.message}`);
  }
}

module.exports = extractPdf;

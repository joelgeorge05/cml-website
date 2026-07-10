const pdfParse = require('pdf-parse').default;

async function extractPdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    return { text: data.text, success: true };
  } catch (err) {
    console.error('PDF parsing error:', err);
    throw new Error(`Failed to parse PDF: ${err.message}`);
  }
}

module.exports = extractPdf;

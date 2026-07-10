try {
  const pdfParse = require('pdf-parse');
  console.log('type', typeof pdfParse);
  console.log('keys', Object.keys(pdfParse));
  console.log('default type', typeof pdfParse.default);
} catch (e) {
  console.error('load error', e);
}

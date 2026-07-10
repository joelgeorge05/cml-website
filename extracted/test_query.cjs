const http = require('http');

console.log('Fetching App.tsx...');
const req = http.get('http://127.0.0.1:3000/src/App.tsx', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    if (res.statusCode >= 400) {
      console.log('ERROR BODY:', body);
    } else {
      console.log(`BODY LENGTH: ${body.length}`);
      console.log('First 600 chars of body:', body.substring(0, 600));
    }
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
});

req.end();

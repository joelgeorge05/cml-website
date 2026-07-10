const https = require('https');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  const url = 'https://www.cmlthalassery.org/about/';
  try {
    const html = await fetchHtml(url);
    console.log("Found matches in about page:");
    const matches = [...html.matchAll(/src="([^"]+?Founder[^"]+?)"/g)];
    for (const match of matches) {
      console.log(match[1]);
    }
  } catch (e) {
    console.error(e);
  }
}

run();

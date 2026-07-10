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
  const query = 'Fr Joseph Maliparambil site:cmlthalassery.org';
  console.log(`Results for: ${query}`);
  const searchUrl = 'https://www.bing.com/images/search?q=' + encodeURIComponent(query);
  try {
    const html = await fetchHtml(searchUrl);
    const matches = [...html.matchAll(/murl&quot;:&quot;(https:\/\/.*?)&quot;/g)];
    console.log(`Found ${matches.length} matches.`);
    for (let i = 0; i < Math.min(matches.length, 12); i++) {
      console.log(`- ${matches[i][1]}`);
    }
  } catch (e) {
    console.error(e);
  }
}

run();

const https = require('https');
const fs = require('fs');
const path = require('path');

const images = [
  'https://www.cmlthalassery.org/upload/Founder/9759888d5df60793f73509c1cb0281b0.png',
  'https://www.cmlthalassery.org/upload/Founder/9aedb1d0dcde4ef82b2c40824905d046.png',
  'https://www.cmlthalassery.org/upload/Founder/3c96bffd14b73421819e7ce2317e3566.png',
  'https://www.cmlthalassery.org/upload/Founder/72ccf4d2b85fee6fec7ecc98c5b2a716.png',
  'https://www.cmlthalassery.org/upload/Founder/2a026b09e49c8aa3879ce2d2aaba29e1.png',
  'https://4.bp.blogspot.com/_Q9eJ0BbiudM/SvloERDTK4I/AAAAAAAAATE/jcFIXUUIL0E/s320/mission%2520league%2520Kunjettan.jpg',
  'https://cnewsliveenglish.com/images/fr-joseph-maliparambil-memorial-and-award-distribution-to-be-held-tomorrow-in-arpookkara-tt-121920251036.jpg'
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: status ${res.statusCode}`));
        return;
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  for (let i = 0; i < images.length; i++) {
    const filename = `founder_temp_${i + 1}${path.extname(images[i]) || '.png'}`;
    const dest = path.join(__dirname, 'src/assets/images', filename);
    console.log(`Downloading ${images[i]} as ${filename}...`);
    try {
      await downloadFile(images[i], dest);
      console.log(`✅ Success`);
    } catch (e) {
      console.log(`❌ Fail: ${e.message}`);
    }
  }
}

run();

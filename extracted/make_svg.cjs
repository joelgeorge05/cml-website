const fs = require('fs');
const path = require('path');

const imgPath = path.join(__dirname, 'src', 'assets', 'images', 'logo.jpg');
const imgData = fs.readFileSync(imgPath);
const base64Str = imgData.toString('base64');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <clipPath id="circleView">
      <circle cx="50" cy="50" r="50" />
    </clipPath>
  </defs>
  <image width="100" height="100" href="data:image/jpeg;base64,${base64Str}" clip-path="url(#circleView)" />
</svg>`;

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
console.log('Successfully created public/favicon.svg');

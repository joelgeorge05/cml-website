const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to match the aspect ratio of the poster's elongated laptop screen (889x905)
  // width: 1440, height: 1440 * (905/889) = 1466
  await page.setViewport({ width: 1440, height: 1466 });
  
  // Navigate to the local server
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Wait a bit extra for animations/images to load (5 seconds)
  await new Promise(r => setTimeout(r, 5000));
  
  // Take screenshot
  await page.screenshot({ path: 'landing_screenshot.png' });
  
  await browser.close();
})();

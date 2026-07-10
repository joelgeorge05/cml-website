const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const fileId = '1LMnCmEGElT_jqj-sJDxceDhdg25tXIXc';
const outputPath = path.join(__dirname, 'project.zip');

async function run() {
  console.log(`Starting download of Google Drive file ${fileId}...`);
  const url = `https://docs.google.com/uc?export=download&id=${fileId}`;

  // Step 1: Request the file
  const res1 = await fetch(url);
  const text = await res1.text();

  let downloadUrl = url;
  let headers = {};

  if (text.includes('confirm=')) {
    console.log('Confirmation screen detected. Extracting token...');
    
    // Extract confirm token from HTML
    const match = text.match(/confirm=([a-zA-Z0-9_-]+)/);
    if (match) {
      const token = match[1];
      console.log(`Found confirmation token: ${token}`);
      
      downloadUrl = `https://docs.google.com/uc?export=download&confirm=${token}&id=${fileId}`;
      
      // Extract cookies if any
      const setCookie = res1.headers.get('set-cookie');
      if (setCookie) {
        headers['Cookie'] = setCookie;
        console.log('Cookies passed to follow-up request.');
      }
    } else {
      console.warn('Could not extract confirm token. Attempting download directly.');
    }
  } else {
    console.log('No confirmation screen detected. Downloading directly.');
  }

  // Step 2: Download the actual file buffer
  console.log(`Fetching from: ${downloadUrl}`);
  const downloadRes = await fetch(downloadUrl, { headers });
  
  if (!downloadRes.ok) {
    throw new Error(`Failed to download file: ${downloadRes.status} ${downloadRes.statusText}`);
  }

  const arrayBuffer = await downloadRes.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
  console.log(`File successfully saved to ${outputPath} (${arrayBuffer.byteLength} bytes)`);

  // Step 3: Unzip file
  console.log('Extracting archive...');
  const zip = new AdmZip(outputPath);
  
  // Let's list files to log the contents
  const zipEntries = zip.getEntries();
  console.log(`Archive contains ${zipEntries.length} entries.`);
  
  // Extract all files
  zip.extractAllTo(__dirname, true);
  console.log('Extraction complete!');

  // Cleanup zip file
  try {
    fs.unlinkSync(outputPath);
    console.log('Temporary project.zip removed.');
  } catch (err) {
    console.error('Failed to cleanup project.zip:', err);
  }
}

run().catch(err => {
  console.error('Process failed:', err);
  process.exit(1);
});

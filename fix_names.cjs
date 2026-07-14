const fs = require('fs');
function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  const regex = /const displayName = ([a-zA-Z0-9_]+)\.unitName[\s\S]*?\.trim\(\);/g;
  content = content.replace(regex, (match, varName) => {
    return `const displayName = ${varName}.unitName.includes(',') ? ${varName}.unitName.split(',').pop().trim() : ${varName}.unitName;`;
  });
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed ' + file);
}
processFile('src/components/KalolsavamView.tsx');
processFile('src/components/SahithyamalsaramView.tsx');

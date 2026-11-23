const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'backend', 'src', 'main.ts');
let content = fs.readFileSync(mainPath, 'utf8');

content = content.replace("'http://localhost',", "'http://localhost',\n        'https://localhost',");
fs.writeFileSync(mainPath, content);
console.log('Fixed backend main.ts');

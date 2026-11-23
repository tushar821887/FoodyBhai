const fs = require('fs');
const path = require('path');

const capPath = path.join(__dirname, 'admin-app', 'capacitor.config.ts');
let content = fs.readFileSync(capPath, 'utf8');

if (!content.includes('cleartext: true')) {
  content = content.replace("webDir: 'dist/admin-app/browser'", "webDir: 'dist/admin-app/browser',\n  server: {\n    cleartext: true\n  }");
  fs.writeFileSync(capPath, content);
  console.log('Fixed capacitor.config.ts');
} else {
  console.log('Already has cleartext');
}

const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, 'admin-app', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
let content = fs.readFileSync(manifestPath, 'utf8');

if (!content.includes('android:usesCleartextTraffic="true"')) {
  content = content.replace('<application', '<application\\n        android:usesCleartextTraffic="true"');
  // Need actual newline
  content = content.replace('<application\\n', '<application\n');
  fs.writeFileSync(manifestPath, content);
  console.log('Fixed AndroidManifest.xml');
} else {
  console.log('Already has cleartext traffic');
}

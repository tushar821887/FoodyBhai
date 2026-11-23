const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'backend/src/settings/settings.service.ts');
let c = fs.readFileSync(p, 'utf8');
c = c.replace('const result = {};', 'const result: Record<string, any> = {};');
fs.writeFileSync(p, c);

const fs = require('fs');
let content = fs.readFileSync('backend/src/app.module.ts', 'utf8');
content = content.replace(/imports: \[\n    ContactModule,ConfigModule\],/g, "imports: [ConfigModule],");
fs.writeFileSync('backend/src/app.module.ts', content);

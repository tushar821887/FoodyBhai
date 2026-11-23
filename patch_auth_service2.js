const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'auth', 'auth.service.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace("passwordHash = agent.passwordHash;", "passwordHash = agent.passwordHash || '';");
content = content.replace("sub: userId,", "sub: userId as string,");
content = content.replace("role: role,", "role: role as string,");
fs.writeFileSync(filePath, content);

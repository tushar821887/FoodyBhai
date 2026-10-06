const fs = require('fs');
const path = require('path');

const controllerPath = path.join(__dirname, 'backend', 'src', 'users', 'users.controller.ts');
let content = fs.readFileSync(controllerPath, 'utf8');

content = content.replace(/@Get\('me'\)\s*@Get\(\)/, "@Get()");

fs.writeFileSync(controllerPath, content);
console.log('Fixed users.controller.ts');

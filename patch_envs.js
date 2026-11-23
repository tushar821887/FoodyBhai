const fs = require('fs');

const fDev = 'frontend/src/environments/environment.development.ts';
let fContent = fs.readFileSync(fDev, 'utf8');
fContent = fContent.replace("'https://api.foodybhai.in/api'", "'http://localhost:3000/api'");
fs.writeFileSync(fDev, fContent);

const aDev = 'admin-app/src/environments/environment.development.ts';
let aContent = fs.readFileSync(aDev, 'utf8');
aContent = aContent.replace("'https://api.foodybhai.in/api'", "'http://localhost:3000/api'");
fs.writeFileSync(aDev, aContent);

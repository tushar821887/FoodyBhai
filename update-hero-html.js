const fs = require('fs');
const path = 'frontend/src/app/components/hero/hero.html';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/100% Delivery Only/g, 'Takeaway & Delivery');
content = content.replace(/delivery-only kitchen/g, 'premium kitchen');
content = content.replace(/Minutes Delivery/g, 'Minutes Prep Time');

fs.writeFileSync(path, content);

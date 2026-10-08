const fs = require('fs');
let content = fs.readFileSync('frontend/src/app/pages/cart/cart.ts', 'utf8');
content = content.replace(/this\.isProcessing = false;/g, '');
fs.writeFileSync('frontend/src/app/pages/cart/cart.ts', content);

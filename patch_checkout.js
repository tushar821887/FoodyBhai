const fs = require('fs');
const file = 'frontend/src/app/pages/cart/cart.ts';
let code = fs.readFileSync(file, 'utf8');

const regex = /checkout\(\) {\s*if \(!this\.authService\.isLoggedIn\(\)\) {\s*this\.uiService\.openAuthModal\(\);\s*return;\s*}/;

code = code.replace(regex, `checkout() {\n    // Allow guest checkout`);
fs.writeFileSync(file, code);
console.log("Patched checkout() to allow guest checkout");

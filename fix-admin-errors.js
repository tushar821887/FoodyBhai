const fs = require('fs');

// Fix TS
const tsPath = 'admin-app/src/app/pages/orders/orders.page.ts';
let ts = fs.readFileSync(tsPath, 'utf8');
ts = ts.replace(/currentView: 'dashboard' \| 'agents' = 'dashboard';/, `currentView: 'dashboard' | 'agents' | 'settings' = 'dashboard';`);
fs.writeFileSync(tsPath, ts);

// Fix HTML
const htmlPath = 'admin-app/src/app/pages/orders/orders.page.html';
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/<\/ng-container>\n\n  <\/ng-container>/, `</ng-container>`);
fs.writeFileSync(htmlPath, html);


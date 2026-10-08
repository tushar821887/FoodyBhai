const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'admin-app/src/app/pages/orders/orders.page.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

htmlContent = htmlContent.replace(
  "style=\"position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; [style.background-color]=\"restaurantOpen ? '#22c55e' : '#cbd5e1'\" transition: .4s; border-radius: 34px;\"",
  "style=\"position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; transition: .4s; border-radius: 34px;\" [style.background-color]=\"restaurantOpen ? '#22c55e' : '#cbd5e1'\""
);

fs.writeFileSync(htmlPath, htmlContent);

const tsPath = path.join(__dirname, 'admin-app/src/app/pages/orders/orders.page.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

// I replaced upiId = ''; before but maybe there's multiple upiId = ''; let's just append it to the class block.
// Let's use a regex to add them right after 'upiId = '';'
tsContent = tsContent.replace("upiId = '';", "upiId = '';\n  restaurantOpen = true;\n  restaurantClosedReason = 'We are currently closed. Please check back later.';");

fs.writeFileSync(tsPath, tsContent);

const fs = require('fs');
const path = require('path');
const tsPath = path.join(__dirname, 'admin-app/src/app/pages/orders/orders.page.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

tsContent = tsContent.replace("upiId: string = 'foodybhai@okaxis';", "upiId: string = 'foodybhai@okaxis';\n  restaurantOpen = true;\n  restaurantClosedReason = 'We are currently closed. Please check back later.';");
fs.writeFileSync(tsPath, tsContent);

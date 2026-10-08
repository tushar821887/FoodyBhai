const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'admin-app/src/app/pages/orders/orders.page.html');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "background-color: #cbd5e1;",
  "[style.background-color]=\"restaurantOpen ? '#22c55e' : '#cbd5e1'\""
);

fs.writeFileSync(filePath, content);

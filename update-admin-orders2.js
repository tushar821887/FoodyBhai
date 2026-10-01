const fs = require('fs');

const path = 'admin-app/src/app/pages/orders/orders.page.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/this\.playNotificationSound\(\);/, `this.playNotificationSound();
          alert('🔔 New Order Arrived!');`);

fs.writeFileSync(path, content);

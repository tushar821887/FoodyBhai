const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'admin-app/src/app/pages/orders/orders.page.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Add properties
content = content.replace(
  "upiId = '';",
  "upiId = '';\n  restaurantOpen = true;\n  restaurantClosedReason = 'We are currently closed. Please check back later.';"
);

// Fetch settings
content = content.replace(
  "this.api.getSetting('foodybhai_qr').subscribe(res => { if (res && res.value) this.qrImageUrl = res.value; });",
  "this.api.getSetting('foodybhai_qr').subscribe(res => { if (res && res.value) this.qrImageUrl = res.value; });\n      this.api.getSetting('restaurant_open').subscribe(res => { if (res && res.value !== undefined) this.restaurantOpen = res.value === 'true' || res.value === true; });\n      this.api.getSetting('restaurant_closed_reason').subscribe(res => { if (res && res.value) this.restaurantClosedReason = res.value; });"
);

// Save settings method
content = content.replace(
  "this.api.saveSetting('foodybhai_qr', this.qrImageUrl).subscribe();",
  "this.api.saveSetting('foodybhai_qr', this.qrImageUrl).subscribe();\n    this.api.saveSetting('restaurant_open', this.restaurantOpen).subscribe();\n    this.api.saveSetting('restaurant_closed_reason', this.restaurantClosedReason).subscribe();"
);

fs.writeFileSync(filePath, content);

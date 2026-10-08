const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'admin-app/src/app/pages/orders/orders.page.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the load settings code in setView
content = content.replace(
  "const savedUpi = localStorage.getItem('foodybhai_upi');",
  "this.api.getSetting('foodybhai_upi').subscribe(val => { if (val) this.upiId = val; });"
);
content = content.replace(
  "const savedQr = localStorage.getItem('foodybhai_qr');",
  "this.api.getSetting('foodybhai_qr').subscribe(val => { if (val) this.qrImageUrl = val; });"
);
content = content.replace("if (savedUpi) this.upiId = savedUpi;", "");
content = content.replace("if (savedQr) this.qrImageUrl = savedQr;", "");

// Replace the save settings code
content = content.replace(
  "localStorage.setItem('foodybhai_upi', this.upiId);",
  "this.api.saveSetting('foodybhai_upi', this.upiId).subscribe();"
);
content = content.replace(
  "localStorage.setItem('foodybhai_qr', this.qrImageUrl);",
  "this.api.saveSetting('foodybhai_qr', this.qrImageUrl).subscribe(() => alert('Settings saved successfully!'));"
);
content = content.replace("alert('Settings saved successfully!');", "");

fs.writeFileSync(filePath, content);

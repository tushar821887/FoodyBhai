const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'admin-app/src/app/pages/orders/orders.page.ts');
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace("this.api.getSetting('foodybhai_upi').subscribe(val => { if (val) this.upiId = val; });", "this.api.getSetting('foodybhai_upi').subscribe(res => { if (res && res.value) this.upiId = res.value; });");
content = content.replace("this.api.getSetting('foodybhai_qr').subscribe(val => { if (val) this.qrImageUrl = val; });", "this.api.getSetting('foodybhai_qr').subscribe(res => { if (res && res.value) this.qrImageUrl = res.value; });");
fs.writeFileSync(filePath, content);

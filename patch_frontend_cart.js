const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'frontend/src/app/pages/cart/cart.ts');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('restaurantOpen = true;')) {
  content = content.replace("upiId = 'foodybhai@okaxis';", "upiId = 'foodybhai@okaxis';\n  restaurantOpen = true;\n  restaurantClosedReason = '';");
  content = content.replace("this.orderService.getSetting('foodybhai_upi').subscribe", "this.orderService.getSetting('restaurant_open').subscribe(res => { if (res && res.value !== undefined) { this.restaurantOpen = res.value === 'true' || res.value === true; this.cdr.detectChanges(); } });\n      this.orderService.getSetting('restaurant_closed_reason').subscribe(res => { if (res && res.value) { this.restaurantClosedReason = res.value; this.cdr.detectChanges(); } });\n      this.orderService.getSetting('foodybhai_upi').subscribe");

  // In placeOrder method
  content = content.replace(
    "if (!this.authService.isAuthenticated())",
    "if (!this.restaurantOpen) { this.showToast(this.restaurantClosedReason || 'Restaurant is currently closed', 'error'); return; }\n    if (!this.authService.isAuthenticated())"
  );
}
fs.writeFileSync(filePath, content);

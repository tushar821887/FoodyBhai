const fs = require('fs');
const path = 'frontend/src/app/pages/cart/cart.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/if \(step === 3\) \{[\s\S]*?\}\n    \}/, `if (step === 3) {
      if (!this.customerName || !this.customerPhone) {
        alert("Please fill in your Name and Phone Number.");
        return;
      }
      if (this.orderType === 'delivery') {
        if (this.authService.isLoggedIn() && !this.selectedAddressId && this.savedAddresses.length > 0) {
          alert("Please select a delivery address.");
          return;
        }
        if (!this.authService.isLoggedIn() && !this.deliveryAddress) {
          alert("Please provide a delivery address.");
          return;
        }
      }
    }`);

fs.writeFileSync(path, content);

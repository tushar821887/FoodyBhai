const fs = require('fs');
const path = 'frontend/src/app/pages/cart/cart.ts';
let content = fs.readFileSync(path, 'utf8');

// Add orderType property
content = content.replace(/customerPhone = '';/, `customerPhone = '';
  orderType: 'delivery' | 'pickup' = 'delivery';`);

// Update checkout() payload
content = content.replace(/totalAmount: this.currentTotal,/, `totalAmount: this.currentTotal,
        orderType: this.orderType,`);

// If pickup is selected, address can be optional? Actually, let's just send 'Store Pickup' as address if pickup.
// Inside checkout:
content = content.replace(/let finalAddress = this.deliveryAddress;/, `let finalAddress = this.deliveryAddress;
    if (this.orderType === 'pickup') {
      finalAddress = 'Self Pickup';
    }`);

// Also disable address validation if pickup:
content = content.replace(/if \(!this.customerName \|\| !this.customerPhone \|\| !finalAddress\) \{/, `if (!this.customerName || !this.customerPhone || (this.orderType === 'delivery' && !finalAddress)) {`);

fs.writeFileSync(path, content);

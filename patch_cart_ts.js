const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'cart', 'cart.ts');
let content = fs.readFileSync(tsPath, 'utf8');

const oldPlaceOrder = `    this.orderService.placeOrder({
      items,
      totalAmount: this.currentTotal,
      orderType: this.orderType,
      paymentMethod: this.paymentMethod,
      deliveryDetails: {
        name: this.customerName,
        phone: this.customerPhone,
        address: finalAddress
      }
    }).subscribe({`;
    
const newPlaceOrder = `    let itemTotal = 0, discount = 0, gst = 0, platformFee = 0;
    this.cartService.totalPrice$.subscribe(v => itemTotal = v).unsubscribe();
    this.cartService.discount$.subscribe(v => discount = v).unsubscribe();
    this.cartService.gst$.subscribe(v => gst = v).unsubscribe();
    this.cartService.platformFee$.subscribe(v => platformFee = v).unsubscribe();

    this.orderService.placeOrder({
      items,
      itemTotal,
      discount,
      gst,
      platformFee,
      totalAmount: this.currentTotal,
      orderType: this.orderType,
      paymentMethod: this.paymentMethod,
      deliveryDetails: {
        name: this.customerName,
        phone: this.customerPhone,
        address: finalAddress
      }
    }).subscribe({`;

content = content.replace(oldPlaceOrder, newPlaceOrder);
fs.writeFileSync(tsPath, content);
console.log('Fixed cart.ts');

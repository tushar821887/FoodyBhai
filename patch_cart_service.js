const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'frontend', 'src', 'app', 'services', 'cart.service.ts');
let content = fs.readFileSync(servicePath, 'utf8');

// Add new Observables
const oldFinalPrice = `  public finalPrice$ = this.totalPrice$.pipe(
    map(total => {
      const discount = this.couponSubject.value.toUpperCase() === 'FOODY20' ? Math.round(total * 0.2) : 0;
      return total - discount;
    })
  );`;
  
const newFinalPrice = `  public platformFee$ = this.totalPrice$.pipe(map(total => total > 0 ? 5 : 0));
  public gst$ = this.totalPrice$.pipe(map(total => total > 0 ? Math.round(total * 0.05) : 0));

  public finalPrice$ = this.totalPrice$.pipe(
    map(total => {
      if (total === 0) return 0;
      const discount = this.couponSubject.value.toUpperCase() === 'FOODY20' ? Math.round(total * 0.2) : 0;
      const platformFee = 5;
      const gst = Math.round(total * 0.05);
      return total - discount + platformFee + gst;
    })
  );`;

content = content.replace(oldFinalPrice, newFinalPrice);

const oldWhatsApp = `    const coupon = this.couponSubject.value.toUpperCase();
    if (coupon === 'FOODY20') {
        const discount = Math.round(total * 0.2);
        const finalTotal = total - discount;
        text += \`\\nSubtotal: ₹\${total}\`;
        text += \`\\nDiscount (FOODY20): -₹\${discount}\`;
        text += \`\\n*Total to Pay: ₹\${finalTotal}*\`;
    } else {
        text += \`\\n*Total to Pay: ₹\${total}*\`;
    }`;
    
const newWhatsApp = `    const coupon = this.couponSubject.value.toUpperCase();
    const discount = coupon === 'FOODY20' ? Math.round(total * 0.2) : 0;
    const platformFee = 5;
    const gst = Math.round(total * 0.05);
    const finalTotal = total - discount + platformFee + gst;
    
    text += \`\\nSubtotal: ₹\${total}\`;
    if (discount > 0) text += \`\\nDiscount (FOODY20): -₹\${discount}\`;
    text += \`\\nGST (5%): ₹\${gst}\`;
    text += \`\\nPlatform Fee: ₹\${platformFee}\`;
    text += \`\\n*Total to Pay: ₹\${finalTotal}*\`;`;

content = content.replace(oldWhatsApp, newWhatsApp);
fs.writeFileSync(servicePath, content);
console.log('Fixed cart.service.ts');

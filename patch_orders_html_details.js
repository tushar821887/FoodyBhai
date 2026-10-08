const fs = require('fs');
let content = fs.readFileSync('frontend/src/app/pages/orders/orders.html', 'utf8');

const newFields = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #64748b; font-size: 14px;" *ngIf="selectedOrderDetails.deliveryCharge !== undefined">
          <span>Delivery Charge</span>
          <span>₹{{ selectedOrderDetails.deliveryCharge || 0 }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #10b981; font-size: 14px;" *ngIf="selectedOrderDetails.discount">
          <span>Discount applied</span>
          <span>-₹{{ selectedOrderDetails.discount }}</span>
        </div>
`;

content = content.replace(
  /<div style="display: flex; justify-content: space-between; margin-bottom: 15px; color: #64748b; font-size: 14px;">\s*<span>Platform Fee<\/span>\s*<span>₹\{\{ selectedOrderDetails\.platformFee \|\| 0 \}\}<\/span>\s*<\/div>/,
  `<div style="display: flex; justify-content: space-between; margin-bottom: 15px; color: #64748b; font-size: 14px;">
          <span>Platform Fee</span>
          <span>₹{{ selectedOrderDetails.platformFee || 0 }}</span>
        </div>` + newFields
);

fs.writeFileSync('frontend/src/app/pages/orders/orders.html', content);
console.log('patched modal with delivery/discount');

const fs = require('fs');
let content = fs.readFileSync('frontend/src/app/pages/orders/orders.html', 'utf8');

content = content.replace(
  /<div style="font-size: 13px; color: #64748b; margin-bottom: 4px; font-weight: 500;">\{\{ order\.items\.length \}\} Item\(s\)<\/div>/,
  `<div style="font-size: 13px; color: #64748b; margin-bottom: 4px; font-weight: 500;">
                  {{ order.items.length }} Item(s) • 
                  <span style="color: #10b981; font-weight: 600;" *ngIf="order.paymentMethod === 'online'"><i class="fa-solid fa-credit-card"></i> Online Payment</span>
                  <span style="color: var(--primary-color); font-weight: 600;" *ngIf="order.paymentMethod !== 'online'"><i class="fa-solid fa-money-bill-wave"></i> COD</span>
                </div>`
);

fs.writeFileSync('frontend/src/app/pages/orders/orders.html', content);
console.log('patched order list item');

const fs = require('fs');
const path = 'frontend/src/app/pages/orders/orders.html';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/<div class="payment-mode">\n                    <i class="fa-solid fa-receipt" style="color: #64748b;"><\/i> Ordered directly\n                  <\/div>/, 
  `<div class="payment-mode">
                    <i class="fa-solid fa-receipt" style="color: #64748b;"></i> Ordered directly
                  </div>
                  @if (order.status === 'delivered') {
                    <button class="btn btn-reorder" style="width: 100%; margin-top: 15px; background: var(--primary-color); border: none; padding: 10px; border-radius: 8px; color: white; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s;" (click)="reorder(order)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                      <i class="fa-solid fa-rotate-right"></i> Reorder Items
                    </button>
                  }`);

fs.writeFileSync(path, content);

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const targetTotalAmount = `<div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #1e293b; font-weight: 700; font-size: 16px;">Total Amount</span>
          <span style="font-size: 20px; font-weight: 800; color: var(--primary-color);">₹{{ selectedOrderDetails.totalAmount }}</span>
        </div>`;

const newTotalAndPayment = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="color: #1e293b; font-weight: 700; font-size: 16px;">Total Amount</span>
          <span style="font-size: 20px; font-weight: 800; color: var(--primary-color);">₹{{ selectedOrderDetails.totalAmount }}</span>
        </div>
        <div style="height: 1px; background: #e2e8f0; margin-bottom: 12px; border-top: 1px dashed #cbd5e1;"></div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #64748b; font-size: 14px;">Payment Mode</span>
          <span style="font-weight: 600; color: #1e293b; font-size: 14px;">
            @if (selectedOrderDetails.paymentMethod === 'online') {
              <i class="fa-solid fa-credit-card" style="color: #10b981; margin-right: 5px;"></i> ONLINE
            } @else {
              <i class="fa-solid fa-money-bill-wave" style="color: var(--primary-color); margin-right: 5px;"></i> CASH ON DELIVERY
            }
          </span>
        </div>`;

htmlContent = htmlContent.replace(targetTotalAmount, newTotalAndPayment);
fs.writeFileSync(htmlPath, htmlContent);
console.log('Fixed payment display');

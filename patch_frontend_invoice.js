const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Replace the total amount section in the modal with a price breakdown
const oldTotalModal = `<div style="background: #f8fafc; border-radius: 12px; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #64748b; font-weight: 600;">Total Amount</span>
        <span style="font-size: 20px; font-weight: 800; color: var(--primary-color);">₹{{ selectedOrderDetails.totalAmount }}</span>
      </div>`;

const newTotalModal = `<div style="background: #f8fafc; border-radius: 12px; padding: 15px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #64748b; font-size: 14px;">
          <span>Item Total</span>
          <span>₹{{ selectedOrderDetails.totalAmount - (selectedOrderDetails.gst || 0) - (selectedOrderDetails.platformFee || 0) }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #64748b; font-size: 14px;">
          <span>GST (5%)</span>
          <span>₹{{ selectedOrderDetails.gst || 0 }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; color: #64748b; font-size: 14px;">
          <span>Platform Fee</span>
          <span>₹{{ selectedOrderDetails.platformFee || 0 }}</span>
        </div>
        <div style="height: 1px; background: #e2e8f0; margin-bottom: 15px;"></div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #1e293b; font-weight: 700; font-size: 16px;">Total Amount</span>
          <span style="font-size: 20px; font-weight: 800; color: var(--primary-color);">₹{{ selectedOrderDetails.totalAmount }}</span>
        </div>
      </div>
      
      @if (selectedOrderDetails.status === 'delivered') {
        <button style="width: 100%; margin-top: 15px; padding: 12px; background: white; border: 1px solid var(--primary-color); color: var(--primary-color); border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: all 0.2s;" onmouseover="this.style.background='#fffbeb'" onmouseout="this.style.background='white'" (click)="downloadInvoice(selectedOrderDetails._id || selectedOrderDetails.id)">
          <i class="fa-solid fa-file-invoice"></i> Download Invoice
        </button>
      }`;

htmlContent = htmlContent.replace(oldTotalModal, newTotalModal);
fs.writeFileSync(htmlPath, htmlContent);
console.log('Fixed HTML');

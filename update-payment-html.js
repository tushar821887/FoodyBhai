const fs = require('fs');
const path = 'admin-app/src/app/pages/orders/orders.page.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Sidebar Settings Link
content = content.replace(/<a class="nav-item">\n\s*<i class="icon">🍽️<\/i>\n\s*<span>Menu<\/span>\n\s*<\/a>/, `<a class="nav-item">\n        <i class="icon">🍽️</i>\n        <span>Menu</span>\n      </a>\n      <a class="nav-item" [class.active]="currentView === 'settings'" (click)="setView('settings')">\n        <i class="icon">⚙️</i>\n        <span>Settings</span>\n      </a>`);

// 2. Change Mark Delivered buttons
content = content.replace(/<button class="btn btn-dark" \(click\)="updateStatus\(order\._id, 'delivered'\)">Mark Delivered<\/button>/g, `<button class="btn btn-dark" (click)="openPaymentModal(order)">Mark Delivered</button>`);
content = content.replace(/<button class="btn btn-success" \*ngIf="order\.orderType === 'pickup'" \(click\)="updateStatus\(order\._id, 'delivered'\)">Mark Picked Up<\/button>/g, `<button class="btn btn-success" *ngIf="order.orderType === 'pickup'" (click)="openPaymentModal(order)">Mark Picked Up</button>`);

// 3. Add Settings View
content = content.replace(/<\/main>\n<\/div>/, `</ng-container>

    <!-- SETTINGS VIEW -->
    <ng-container *ngIf="currentView === 'settings'">
      <div class="agents-container">
        <h2>Store Settings</h2>
        
        <div class="add-agent-card">
          <h3>Payment Settings</h3>
          <p style="color: #64748b; margin-bottom: 20px; font-size: 14px;">Configure the QR code and UPI ID shown to delivery agents when collecting online payments.</p>
          
          <div class="settings-form" style="display: flex; flex-direction: column; gap: 15px;">
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 5px;">UPI ID</label>
              <input type="text" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px;" [(ngModel)]="upiId" placeholder="e.g. yourname@upi">
            </div>
            
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 5px;">QR Code Image URL</label>
              <input type="text" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px;" [(ngModel)]="qrImageUrl" placeholder="https://link-to-your-qr.jpg">
            </div>

            <div *ngIf="qrImageUrl" style="margin-top: 10px; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; width: fit-content;">
              <img [src]="qrImageUrl" alt="QR Code Preview" style="width: 150px; height: 150px; object-fit: contain;">
            </div>

            <button class="btn-primary" style="padding: 12px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; margin-top: 10px; width: 150px;" (click)="saveSettings()">Save Settings</button>
          </div>
        </div>
      </div>
    </ng-container>

  </main>
</div>`);

// 4. Add Payment Modal
const paymentModal = `
<!-- Payment & Delivery Modal -->
<div class="modal-overlay" *ngIf="showPaymentModal">
  <div class="modal-content assign-modal">
    <div class="modal-header">
      <div class="modal-icon-wrapper" style="background: #ecfdf5; color: #10b981;">
        <span class="modal-icon">💰</span>
      </div>
      <h3>Complete Delivery</h3>
      <p class="modal-subtitle">Verify payment collection of <strong>₹{{ orderToDeliver?.totalAmount }}</strong></p>
    </div>
    
    <div class="payment-selection" style="display: flex; gap: 10px; margin-bottom: 20px;">
      <label class="agent-select-item" style="flex: 1; text-align: center; display: block;" [class.selected]="selectedPaymentMethod === 'online'">
        <input type="radio" name="paymethod" value="online" [(ngModel)]="selectedPaymentMethod" style="display: none;">
        <strong>📱 Online (QR)</strong>
      </label>
      <label class="agent-select-item" style="flex: 1; text-align: center; display: block;" [class.selected]="selectedPaymentMethod === 'cod'">
        <input type="radio" name="paymethod" value="cod" [(ngModel)]="selectedPaymentMethod" style="display: none;">
        <strong>💵 Cash (COD)</strong>
      </label>
    </div>

    <!-- Online QR View -->
    <div *ngIf="selectedPaymentMethod === 'online'" style="text-align: center; margin-bottom: 20px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
      <img [src]="qrImageUrl" style="width: 180px; height: 180px; margin-bottom: 15px; border-radius: 8px; object-fit: contain;">
      <div style="font-size: 16px; font-weight: 700; color: #1e293b;">Scan to Pay</div>
      <div style="font-size: 14px; color: #64748b; margin-top: 5px;">{{ upiId }}</div>
    </div>

    <!-- COD View -->
    <div *ngIf="selectedPaymentMethod === 'cod'" style="text-align: center; margin-bottom: 20px; background: #fffbeb; padding: 20px; border-radius: 12px; border: 1px solid #fde68a;">
      <div style="font-size: 32px; font-weight: 800; color: #b45309; margin-bottom: 10px;">₹{{ orderToDeliver?.totalAmount }}</div>
      <label style="display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 16px; font-weight: 600; cursor: pointer;">
        <input type="checkbox" [(ngModel)]="cashReceived" style="width: 20px; height: 20px; accent-color: #f59e0b;">
        I have received the cash
      </label>
    </div>

    <div class="modal-actions full-width">
      <button class="btn-cancel-modal" (click)="showPaymentModal = false">Cancel</button>
      <button class="btn-dispatch-modal" style="background: #10b981; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);" [disabled]="selectedPaymentMethod === 'cod' && !cashReceived" (click)="confirmDelivery()">
        Mark as Delivered
      </button>
    </div>
  </div>
</div>
`;

content = content + paymentModal;

fs.writeFileSync(path, content);

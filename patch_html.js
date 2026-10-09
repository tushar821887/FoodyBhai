const fs = require('fs');
const file = 'admin-app/src/app/pages/orders/orders.page.html';
let code = fs.readFileSync(file, 'utf8');

const desktopLink = `
      <a *ngIf="!isAgent" class="nav-item" [class.active]="currentView === 'cancel-requests'" (click)="setView('cancel-requests')">
        <i class="icon">🔄</i>
        <span>Refund & Cancel</span>
      </a>`;

const mobileLink = `
  <a *ngIf="!isAgent" class="nav-item" [class.active]="currentView === 'cancel-requests'" (click)="setView('cancel-requests')">
    <i class="icon">🔄</i>
    <span>Refund & Cancel</span>
  </a>`;

if (!code.includes("currentView === 'cancel-requests'")) {
  // Insert desktop link before settings link
  code = code.replace(/<a \*ngIf="!isAgent" class="nav-item" \[class\.active\]="currentView === 'settings'"/g, desktopLink.trim() + '\n      <a *ngIf="!isAgent" class="nav-item" [class.active]="currentView === \'settings\'"');
  
  // Actually the above replace might match mobile too if it has *ngIf, let's see. Mobile settings doesn't have *ngIf="!isAgent"
  // Let's check mobile settings link: 
  // <a class="nav-item" [class.active]="currentView === 'settings'"
  code = code.replace(/<a class="nav-item" \[class\.active\]="currentView === 'settings'"/g, mobileLink.trim() + '\n  <a class="nav-item" [class.active]="currentView === \'settings\'"');
  
  const viewContainer = `
  <ng-container *ngIf="currentView === 'cancel-requests'">
    <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 20px;">
      <h2>Refund & Cancellation Requests</h2>
    </div>

    <div class="orders-grid" style="padding: 0 20px;">
      <!-- Filter orders that have pending cancellation request OR pending refund -->
      <div class="order-card" *ngFor="let order of getCancelAndRefundOrders()">
        <div class="order-header">
          <span class="order-id">#{{ (order._id || '').slice(-6) }}</span>
          <span class="time">{{ order.createdAt | date:'short' }}</span>
          <span class="status-badge" [style.backgroundColor]="getStatusBadge(order.status).color">
            {{ getStatusBadge(order.status).label }}
          </span>
        </div>
        <div class="customer-info">
          <strong>{{ order.deliveryDetails?.name }}</strong><br>
          📞 {{ order.deliveryDetails?.phone }}<br>
          📍 {{ order.deliveryDetails?.address }}
        </div>
        <div class="order-items">
          <div class="item" *ngFor="let item of order.items">
            <span class="qty">{{ item.quantity }}x</span> {{ item.recipe?.title || 'Custom Item' }}
          </div>
        </div>
        
        <div class="order-footer">
          <div class="payment-info">
            <span class="total">₹{{ order.totalAmount }}</span>
            <span class="pay-method" [class.paid]="order.paymentStatus === 'paid'">
              {{ order.paymentMethod === 'online' ? 'Online' : 'COD' }} ({{ order.paymentStatus }})
            </span>
          </div>

          <!-- Cancellation Approval -->
          <div *ngIf="order.cancelRequest?.status === 'pending'" style="margin-top: 10px; padding: 10px; background: #fee2e2; border: 1px solid #f87171; border-radius: 6px;">
            <div style="font-size: 12px; color: #b91c1c; font-weight: bold; margin-bottom: 5px;">⚠️ {{ order.cancelRequest?.requestedBy || 'Customer' }} Requested Cancellation</div>
            <div style="font-size: 12px; color: #7f1d1d; margin-bottom: 8px;">Reason: {{ order.cancelRequest?.reason }}</div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-success" style="flex: 1; padding: 6px; font-size: 12px;" (click)="resolveCancel(order, true)">Approve</button>
              <button class="btn btn-outline-danger" style="flex: 1; padding: 6px; font-size: 12px; background: white;" (click)="resolveCancel(order, false)">Reject</button>
            </div>
          </div>
          
          <!-- Refund Action -->
          <div *ngIf="order.status === 'cancelled' && order.refundStatus === 'pending'" style="margin-top: 10px; padding: 10px; background: #e0e7ff; border: 1px solid #818cf8; border-radius: 6px;">
            <div style="font-size: 12px; color: #3730a3; font-weight: bold; margin-bottom: 5px;">💸 Pending Refund</div>
            <div style="font-size: 12px; color: #312e81; margin-bottom: 8px;">Order cancelled but refund not yet processed.</div>
            <button class="btn btn-primary" style="width: 100%; padding: 6px; font-size: 12px; background: #4f46e5;" (click)="processRefund(order)">Mark Refund as Processed</button>
          </div>

        </div>
      </div>
      
      <div *ngIf="getCancelAndRefundOrders().length === 0" class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #64748b; background: white; border-radius: 12px;">
        <i class="icon" style="font-size: 48px; display: block; margin-bottom: 10px;">✅</i>
        No pending refund or cancellation requests.
      </div>
    </div>
  </ng-container>
`;

  // Insert before <!-- Mobile Bottom Navigation -->
  code = code.replace(/<!-- Mobile Bottom Navigation -->/g, viewContainer + '\n\n<!-- Mobile Bottom Navigation -->');
  fs.writeFileSync(file, code);
  console.log("HTML patched.");
} else {
  console.log("HTML already has cancel-requests view.");
}

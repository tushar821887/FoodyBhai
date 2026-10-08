const fs = require('fs');
let content = fs.readFileSync('admin-app/src/app/pages/orders/orders.page.html', 'utf8');

// 1. Top bar toggle
content = content.replace(
  /<div class="top-bar">[\s\S]*?<\/div>\s*<\/div>/,
  `<div class="top-bar">
      <div class="greeting">
        <h2>Welcome, {{ currentUser?.name || 'User' }}</h2>
        <p>Here's what's happening in your kitchen today.</p>
      </div>
      <div class="header-actions" *ngIf="!isAgent" style="display: flex; align-items: center; gap: 15px; background: white; padding: 10px 20px; border-radius: 50px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <span style="font-weight: 700; font-size: 15px; color: #334155;">{{ restaurantOpen ? 'Accepting Orders' : 'Offline' }}</span>
        <label class="switch" style="position: relative; display: inline-block; width: 50px; height: 28px; margin: 0;">
          <input type="checkbox" [(ngModel)]="restaurantOpen" (change)="toggleRestaurantStatus()" style="opacity: 0; width: 0; height: 0;">
          <span class="slider round" [class.active]="restaurantOpen" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; transition: .4s; border-radius: 34px;" [style.background-color]="restaurantOpen ? '#22c55e' : '#cbd5e1'">
            <span class="knob" [style.transform]="restaurantOpen ? 'translateX(22px)' : 'translateX(0)'" style="position: absolute; content: ''; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;"></span>
          </span>
        </label>
      </div>
    </div>`
);

// 2. Payout summary
content = content.replace(
  /<div class="order-list"/,
  `      <div *ngIf="currentTab === 'completed'" class="payout-summary animate-fade-in" style="display: flex; gap: 20px; margin-bottom: 20px; background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="flex: 1; text-align: center; border-right: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Total Orders Delivered</div>
          <div style="font-size: 32px; font-weight: 800; color: #0f172a;">{{ totalCompletedOrders }}</div>
        </div>
        <div style="flex: 1; text-align: center;">
          <div style="color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Total Payout Amount</div>
          <div style="font-size: 32px; font-weight: 800; color: #10b981;">₹{{ totalPayoutAmount }}</div>
        </div>
      </div>

      <div class="order-list"`
);

// 3. Agent deliveries count
content = content.replace(
  /<p>📞 \{\{ agent\.phone \}\}<\/p>/,
  `<p>📞 {{ agent.phone }}</p>
              <div style="margin-top: 8px; font-size: 13px; color: #475569; display: flex; align-items: center; gap: 6px;">
                <span style="background: #ecfdf5; color: #10b981; padding: 4px 8px; border-radius: 12px; font-weight: 700;">{{ getAgentDeliveryCount(agent.phone) }} Deliveries</span>
              </div>`
);

// 4. Agent Orders Details button
content = content.replace(
  /<button class="btn-edit"/,
  `<button class="btn-orders" (click)="viewAgentOrders(agent)" style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">Orders</button>
              <button class="btn-edit"`
);

// 5. Agent Orders Modal
const modalHtml = `
<!-- Agent Orders Modal -->
<div class="modal-overlay" *ngIf="showAgentOrdersModal">
  <div class="modal-content assign-modal" style="max-width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
    <div class="modal-header">
      <div class="modal-icon-wrapper" style="background: #ecfdf5; color: #10b981;">
        <span class="modal-icon">📦</span>
      </div>
      <h3>Orders Delivered by {{ selectedAgentForOrders?.name }}</h3>
    </div>
    
    <div style="flex: 1; overflow-y: auto; padding: 10px 0;">
      <div *ngIf="selectedAgentOrders.length === 0" style="text-align: center; padding: 30px; color: #64748b;">
        No orders delivered yet.
      </div>
      <div *ngFor="let o of selectedAgentOrders" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <strong style="color: #0f172a;">Order #{{ o._id.slice(-6).toUpperCase() }}</strong>
          <span style="color: #10b981; font-weight: 700;">₹{{ o.totalAmount }}</span>
        </div>
        <div style="font-size: 13px; color: #475569; margin-bottom: 4px;">{{ o.createdAt | date:'medium' }}</div>
        <div style="font-size: 13px; color: #475569;">📍 {{ o.deliveryDetails.address }}</div>
      </div>
    </div>

    <div class="modal-actions full-width" style="margin-top: 15px;">
      <button class="btn-dispatch-modal" style="background: #10b981; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);" (click)="showAgentOrdersModal = false">
        Close
      </button>
    </div>
  </div>
</div>
`;

content = content.replace(/<\/div>\s*$/, modalHtml + '\n');

fs.writeFileSync('admin-app/src/app/pages/orders/orders.page.html', content);
console.log('html patched');

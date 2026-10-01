const fs = require('fs');
const path = 'admin-app/src/app/pages/orders/orders.page.html';
let content = fs.readFileSync(path, 'utf8');

// Replace "Out for Delivery" button
content = content.replace(/<button class="btn btn-info" \(click\)="updateStatus\(order\._id, 'out_for_delivery'\)">Out for Delivery<\/button>/, 
  `<button class="btn btn-info" *ngIf="order.orderType !== 'pickup'" (click)="openAssignAgentModal(order._id)">Out for Delivery</button>
   <button class="btn btn-success" *ngIf="order.orderType === 'pickup'" (click)="updateStatus(order._id, 'delivered')">Mark Picked Up</button>`);

// Add Cancel Order button inside the order card footer next to action buttons
// We'll just add it before the closing </div> of the order card
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<div \*ngIf="filteredOrders\.length === 0"/, 
  `  <div style="margin-top: 10px; border-top: 1px dashed #e2e8f0; padding-top: 10px;" *ngIf="['preparing', 'ready', 'out_for_delivery'].includes(order.status)">
              <button class="btn btn-outline-danger" style="width: 100%;" (click)="rejectOrder(order._id)">Cancel Order</button>
            </div>
          </div>
        </div>
      </div>
      <div *ngIf="filteredOrders.length === 0"`);

fs.writeFileSync(path, content);

const fs = require('fs');
const path = 'admin-app/src/app/pages/orders/orders.page.html';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/<div class="action-buttons" \*ngIf="order\.status === 'out_for_delivery'">\n              <button class="btn btn-dark" \(click\)="updateStatus\(order\._id, 'delivered'\)">Mark Delivered<\/button>\n            <\/div>/, 
  `<div class="action-buttons" *ngIf="order.status === 'out_for_delivery'">
              <button class="btn btn-dark" (click)="updateStatus(order._id, 'delivered')">Mark Delivered</button>
            </div>
            
            <div class="action-buttons" *ngIf="['preparing', 'ready', 'out_for_delivery'].includes(order.status)" style="margin-top: 10px; border-top: 1px dashed #e2e8f0; padding-top: 10px;">
              <button class="btn btn-outline-danger" style="width: 100%;" (click)="rejectOrder(order._id)">Cancel Order</button>
            </div>`);

fs.writeFileSync(path, content);

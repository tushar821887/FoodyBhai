const fs = require('fs');
const path = 'admin-app/src/app/pages/orders/orders.page.html';
let content = fs.readFileSync(path, 'utf8');

// The original reject button is under 'pending'
// Let's replace the reject button under pending, and instead add a global Cancel button at the bottom of the actions
content = content.replace(/<button class="btn-reject" \(click\)="rejectOrder\(order\._id!\)">Reject<\/button>/, `
              <button class="btn-reject" (click)="rejectOrder(order._id!)">Reject</button>`);

// Add Cancel button for active orders
content = content.replace(/<\/div>\n        <\/div>\n      <\/div>\n    <\/div>\n    <\/ng-container>/, `
            <button class="btn-action" style="background: #ef4444; margin-top: 8px;" *ngIf="order.status === 'preparing' || order.status === 'ready' || order.status === 'out_for_delivery'" (click)="rejectOrder(order._id!)">Cancel Order</button>
          </div>
        </div>
      </div>
    </div>
    </ng-container>`);

fs.writeFileSync(path, content);

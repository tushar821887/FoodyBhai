const fs = require('fs');

let content = fs.readFileSync('frontend/src/app/pages/orders/orders.html', 'utf8');

// Insert Filters and Total above orders-list
const filtersHtml = `
      <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 25px; box-shadow: var(--shadow-sm); display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end;">
        <div style="flex: 1; min-width: 200px;">
          <h4 style="margin: 0 0 15px 0; color: #1e293b; font-size: 16px;">Order Statistics</h4>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #64748b; font-weight: 500;">Total Orders</span>
            <span style="font-size: 24px; font-weight: 800; color: var(--primary-color);">{{ orders.length }}</span>
          </div>
        </div>
        
        <div style="flex: 2; display: flex; flex-wrap: wrap; gap: 15px;">
          <div style="flex: 1; min-width: 150px;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 6px;">Time Period</label>
            <select [(ngModel)]="filterDate" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; background: white;">
              <option value="all">All Time</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
            </select>
          </div>
          <div style="flex: 1; min-width: 150px;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 6px;">Order Status</label>
            <select [(ngModel)]="filterStatus" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; background: white;">
              <option value="all">All Statuses</option>
              <option value="completed">Completed/Delivered</option>
              <option value="cancelled">Cancelled/Rejected</option>
            </select>
          </div>
          <div style="flex: 1; min-width: 150px;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 6px;">Payment Method</label>
            <select [(ngModel)]="filterPayment" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; background: white;">
              <option value="all">All Methods</option>
              <option value="online">Online Payment</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>
        </div>
      </div>

      <div class="orders-list">
`;

content = content.replace(/<div class="orders-list">/, filtersHtml);
content = content.replace(/@for \(order of orders; track \$index\) \{/, '@for (order of filteredOrders; track $index) {');

fs.writeFileSync('frontend/src/app/pages/orders/orders.html', content);
console.log('patched frontend orders html');

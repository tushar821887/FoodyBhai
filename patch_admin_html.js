const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'admin-app', 'src', 'app', 'pages', 'orders', 'orders.page.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const oldGrid = `    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-title">New Orders</div>
        <div class="stat-value">{{ (orders | filterStatus:'pending').length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Preparing</div>
        <div class="stat-value">{{ (orders | filterStatus:'preparing').length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Ready</div>
        <div class="stat-value">{{ (orders | filterStatus:'ready').length }}</div>
      </div>
    </div>`;

const newGrid = `    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-title">New Orders</div>
        <div class="stat-value">{{ (orders | filterStatus:'pending').length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Preparing</div>
        <div class="stat-value">{{ (orders | filterStatus:'preparing').length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Ready</div>
        <div class="stat-value">{{ (orders | filterStatus:'ready').length }}</div>
      </div>
      <div class="stat-card" style="background: #fffbeb; border: 1px solid #fde68a;">
        <div class="stat-title" style="color: #92400e;">Store Rating</div>
        <div class="stat-value" style="display: flex; align-items: baseline; gap: 8px; color: #b45309;">
          {{ restaurantStats?.averageRating || '0.0' }} <span style="font-size: 20px; color: #f59e0b;">⭐</span>
        </div>
        <div style="font-size: 12px; color: #92400e; margin-top: 5px; opacity: 0.8;">Based on {{ restaurantStats?.totalReviews || 0 }} reviews</div>
      </div>
    </div>`;

htmlContent = htmlContent.replace(oldGrid, newGrid);
fs.writeFileSync(htmlPath, htmlContent);
console.log('Patched admin orders.page.html');

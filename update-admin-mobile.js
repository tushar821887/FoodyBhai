const fs = require('fs');

const htmlPath = 'admin-app/src/app/pages/orders/orders.page.html';
let html = fs.readFileSync(htmlPath, 'utf8');

const navHtml = `
  <!-- Mobile Bottom Navigation -->
  <nav class="mobile-nav">
    <a class="nav-item" [class.active]="currentView === 'dashboard'" (click)="setView('dashboard')">
      <i class="icon">📊</i>
      <span>Orders</span>
    </a>
    <a class="nav-item" [class.active]="currentView === 'agents'" (click)="setView('agents')">
      <i class="icon">🛵</i>
      <span>Agents</span>
    </a>
    <a class="nav-item" [class.active]="currentView === 'menu'" (click)="setView('menu')">
      <i class="icon">🍽️</i>
      <span>Menu</span>
    </a>
    <a class="nav-item" [class.active]="currentView === 'settings'" (click)="setView('settings')">
      <i class="icon">⚙️</i>
      <span>Settings</span>
    </a>
  </nav>
</div>`;

html = html.replace(/<\/div>\s*$/, navHtml);
fs.writeFileSync(htmlPath, html);

const cssPath = 'admin-app/src/app/pages/orders/orders.page.css';
let css = fs.readFileSync(cssPath, 'utf8');

const navCss = `
/* Mobile Bottom Navigation */
.mobile-nav {
  display: none;
}

@media (max-width: 768px) {
  .mobile-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
    z-index: 1000;
    justify-content: space-around;
    padding: 8px 0;
    border-top: 1px solid #e2e8f0;
  }
  
  .mobile-nav .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #64748b;
    text-decoration: none;
    font-size: 11px;
    font-weight: 500;
    gap: 4px;
    padding: 6px 12px;
    border-radius: 8px;
  }
  
  .mobile-nav .nav-item .icon {
    font-size: 20px;
    font-style: normal;
  }
  
  .mobile-nav .nav-item.active {
    color: #ef4444;
    background: #fef2f2;
  }

  .main-content {
    padding-bottom: 70px !important; /* Space for mobile nav */
  }
}
`;

css += navCss;
fs.writeFileSync(cssPath, css);
console.log("Updated admin mobile nav");

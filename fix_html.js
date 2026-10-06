const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'admin-app', 'src', 'app', 'pages', 'orders', 'orders.page.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// Remove duplicate users nav item in sidebar
const duplicatedUsers = `      <a class="nav-item" [class.active]="currentView === 'users'" (click)="setView('users')">
        <i class="icon">👥</i>
        <span>Users</span>
      </a>
      
  <a class="nav-item" [class.active]="currentView === 'users'" (click)="setView('users')">
    <i class="icon">👥</i>
    <span>Users</span>
  </a>`;

const singleUsers = `      <a class="nav-item" [class.active]="currentView === 'users'" (click)="setView('users')">
        <i class="icon">👥</i>
        <span>Users</span>
      </a>`;

content = content.replace(duplicatedUsers, singleUsers);

// Add users to mobile nav
const oldMobileNav = `<nav class="mobile-nav">
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
</nav>`;

const newMobileNav = `<nav class="mobile-nav">
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
  <a class="nav-item" [class.active]="currentView === 'users'" (click)="setView('users')">
    <i class="icon">👥</i>
    <span>Users</span>
  </a>
  <a class="nav-item" [class.active]="currentView === 'settings'" (click)="setView('settings')">
    <i class="icon">⚙️</i>
    <span>Settings</span>
  </a>
</nav>`;

content = content.replace(oldMobileNav, newMobileNav);

fs.writeFileSync(htmlPath, content);
console.log('Fixed orders.page.html');

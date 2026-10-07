const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'admin-app', 'src', 'app', 'pages', 'orders', 'orders.page.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

tsContent = tsContent.replace(
  "export class OrdersPage implements OnInit, OnDestroy {",
  "export class OrdersPage implements OnInit, OnDestroy {\n  currentUser: any = null;\n  isAgent = false;"
);

tsContent = tsContent.replace(
  "ngOnInit() {",
  `ngOnInit() {
    this.currentUser = this.api.getCurrentUser();
    if (this.currentUser && this.currentUser.role === 'agent') {
      this.isAgent = true;
    }`
);

tsContent = tsContent.replace(
  "this.api.getAllOrders().subscribe(data => {",
  `this.api.getAllOrders().subscribe(data => {
      if (this.isAgent) {
        data = data.filter(o => o.deliveryAgent && o.deliveryAgent.name === this.currentUser.name);
      }`
);

fs.writeFileSync(tsPath, tsContent);

const htmlPath = path.join(__dirname, 'admin-app', 'src', 'app', 'pages', 'orders', 'orders.page.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Hide sidebar tabs for agents
htmlContent = htmlContent.replace(
  "<a class=\"nav-item\" [class.active]=\"currentView === 'agents'\" (click)=\"setView('agents')\">",
  "<a *ngIf=\"!isAgent\" class=\"nav-item\" [class.active]=\"currentView === 'agents'\" (click)=\"setView('agents')\">"
);
htmlContent = htmlContent.replace(
  "<a class=\"nav-item\" [class.active]=\"currentView === 'menu'\" (click)=\"setView('menu')\">",
  "<a *ngIf=\"!isAgent\" class=\"nav-item\" [class.active]=\"currentView === 'menu'\" (click)=\"setView('menu')\">"
);
htmlContent = htmlContent.replace(
  "<a class=\"nav-item\" [class.active]=\"currentView === 'users'\" (click)=\"setView('users')\">",
  "<a *ngIf=\"!isAgent\" class=\"nav-item\" [class.active]=\"currentView === 'users'\" (click)=\"setView('users')\">"
);
htmlContent = htmlContent.replace(
  "<a class=\"nav-item\" [class.active]=\"currentView === 'settings'\" (click)=\"setView('settings')\">",
  "<a *ngIf=\"!isAgent\" class=\"nav-item\" [class.active]=\"currentView === 'settings'\" (click)=\"setView('settings')\">"
);

// Do the same for the mobile bottom nav
htmlContent = htmlContent.replace(
  "<a class=\"nav-item\" [class.active]=\"currentView === 'agents'\" (click)=\"setView('agents')\">\n        <i class=\"icon\">🛵</i>",
  "<a *ngIf=\"!isAgent\" class=\"nav-item\" [class.active]=\"currentView === 'agents'\" (click)=\"setView('agents')\">\n        <i class=\"icon\">🛵</i>"
);
htmlContent = htmlContent.replace(
  "<a class=\"nav-item\" [class.active]=\"currentView === 'menu'\" (click)=\"setView('menu')\">\n        <i class=\"icon\">🍽️</i>",
  "<a *ngIf=\"!isAgent\" class=\"nav-item\" [class.active]=\"currentView === 'menu'\" (click)=\"setView('menu')\">\n        <i class=\"icon\">🍽️</i>"
);
htmlContent = htmlContent.replace(
  "<a class=\"nav-item\" [class.active]=\"currentView === 'users'\" (click)=\"setView('users')\">\n        <i class=\"icon\">👥</i>",
  "<a *ngIf=\"!isAgent\" class=\"nav-item\" [class.active]=\"currentView === 'users'\" (click)=\"setView('users')\">\n        <i class=\"icon\">👥</i>"
);
htmlContent = htmlContent.replace(
  "<a class=\"nav-item\" [class.active]=\"currentView === 'settings'\" (click)=\"setView('settings')\">\n        <i class=\"icon\">⚙️</i>",
  "<a *ngIf=\"!isAgent\" class=\"nav-item\" [class.active]=\"currentView === 'settings'\" (click)=\"setView('settings')\">\n        <i class=\"icon\">⚙️</i>"
);

fs.writeFileSync(htmlPath, htmlContent);

console.log('Patched orders page for agents');

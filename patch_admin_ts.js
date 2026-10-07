const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'admin-app', 'src', 'app', 'pages', 'orders', 'orders.page.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

const newProps = `  categories: any[] = [];
  recipes: any[] = [];
  restaurantStats: any = { averageRating: 0, totalReviews: 0 };`;
tsContent = tsContent.replace("  categories: any[] = [];\n  recipes: any[] = [];", newProps);

const fetchOrdersRegex = /  fetchOrders\(\) \{\s*this\.api\.getOrders\(\)\.subscribe\(data => \{\s*this\.orders = data;\s*this\.filterOrders\(\);\s*this\.calculateActiveOrders\(\);\s*\}\);\s*\}/;

const newFetchOrders = `  fetchOrders() {
    this.api.getOrders().subscribe(data => {
      this.orders = data;
      this.filterOrders();
      this.calculateActiveOrders();
    });
    this.api.getRestaurantStats().subscribe(stats => {
      this.restaurantStats = stats;
      this.cdr.detectChanges();
    });
  }`;
tsContent = tsContent.replace(fetchOrdersRegex, newFetchOrders);

fs.writeFileSync(tsPath, tsContent);
console.log('Patched admin orders.page.ts');

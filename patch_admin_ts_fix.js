const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'admin-app', 'src', 'app', 'pages', 'orders', 'orders.page.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

// The original fetchOrders is:
/*
  fetchOrders() {
    this.api.getAllOrders().subscribe({
      next: (data) => {
        const pendingCount = data.filter(o => o.status === 'pending').length;
        
        if (pendingCount > 0 && !this.isRinging) {
          this.startRinging();
        } else if (pendingCount === 0 && this.isRinging) {
          this.stopRinging();
        }
        
        this.orders = data;
        this.filterOrders();
      },
      error: (err) => console.error('Failed to fetch orders', err)
    });
  }
*/

const oldFetchOrders = `  fetchOrders() {
    this.api.getAllOrders().subscribe({
      next: (data) => {
        const pendingCount = data.filter(o => o.status === 'pending').length;
        
        if (pendingCount > 0 && !this.isRinging) {
          this.startRinging();
        } else if (pendingCount === 0 && this.isRinging) {
          this.stopRinging();
        }
        
        this.orders = data;
        this.filterOrders();
      },
      error: (err) => console.error('Failed to fetch orders', err)
    });
  }`;

const newFetchOrders = `  fetchOrders() {
    this.api.getAllOrders().subscribe({
      next: (data) => {
        const pendingCount = data.filter(o => o.status === 'pending').length;
        
        if (pendingCount > 0 && !this.isRinging) {
          this.startRinging();
        } else if (pendingCount === 0 && this.isRinging) {
          this.stopRinging();
        }
        
        this.orders = data;
        this.filterOrders();
      },
      error: (err) => console.error('Failed to fetch orders', err)
    });
    
    // Fetch live ratings
    this.api.getRestaurantStats().subscribe({
      next: (stats) => {
        this.restaurantStats = stats;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to fetch stats', err)
    });
  }`;

tsContent = tsContent.replace(oldFetchOrders, newFetchOrders);
fs.writeFileSync(tsPath, tsContent);
console.log('Fixed fetchOrders');

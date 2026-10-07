const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.ts');
let content = fs.readFileSync(tsPath, 'utf8');

const newMethods = `
  openRateModal(order: Order) {
    this.orderToRate = order;
    this.ratingValue = order.rating || 5;
    this.reviewText = order.review || '';
    this.showRateModal = true;
  }
  
  setRating(val: number) {
    this.ratingValue = val;
  }
  
  submitRating() {
    if (!this.orderToRate || (!this.orderToRate._id && !this.orderToRate.id)) return;
    const id = this.orderToRate._id || this.orderToRate.id;
    this.orderService.rateOrder(id!, this.ratingValue, this.reviewText).subscribe({
      next: (updatedOrder) => {
        this.showRateModal = false;
        // Update locally
        const idx = this.orders.findIndex(o => o._id === updatedOrder._id || o.id === updatedOrder._id);
        if (idx !== -1) {
          this.orders[idx] = updatedOrder;
        }
      },
      error: (err) => console.error(err)
    });
  }
}
`;

content = content.replace("}\n", newMethods);
fs.writeFileSync(tsPath, content);
console.log('Fixed frontend orders.ts again');

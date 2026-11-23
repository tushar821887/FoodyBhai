const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.ts');
let content = fs.readFileSync(tsPath, 'utf8');

const newImports = `import { OrderService, Order } from '../../services/order.service';\nimport { FormsModule } from '@angular/forms';`;
content = content.replace("import { OrderService, Order } from '../../services/order.service';", newImports);
content = content.replace("imports: [CommonModule, RouterModule],", "imports: [CommonModule, RouterModule, FormsModule],");

const newProps = `  isLoading = true;
  errorMessage = '';
  
  // Rating Modal
  showRateModal = false;
  orderToRate: any = null;
  ratingValue = 5;
  reviewText = '';`;
content = content.replace("  isLoading = true;\n  errorMessage = '';", newProps);

const newMethods = `
  openRateModal(order: any) {
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
      next: (updatedOrder: any) => {
        this.showRateModal = false;
        // Update locally
        const idx = this.orders.findIndex((o: any) => o._id === updatedOrder._id || o.id === updatedOrder._id);
        if (idx !== -1) {
          this.orders[idx] = updatedOrder;
        }
      },
      error: (err: any) => console.error(err)
    });
  }
}
`;

content = content.replace(/  loadOrders\(\) {[\s\S]*?  }\n}/, match => match.slice(0, -2) + newMethods);
fs.writeFileSync(tsPath, content);
console.log('Fixed frontend orders.ts properly');

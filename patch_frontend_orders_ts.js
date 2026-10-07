const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.ts');
let content = fs.readFileSync(tsPath, 'utf8');

const oldImports = `import { OrderService, Order } from '../../services/order.service';`;
const newImports = `import { OrderService, Order } from '../../services/order.service';\nimport { FormsModule } from '@angular/forms';`;

if (!content.includes('import { FormsModule }')) {
  content = content.replace(oldImports, newImports);
  content = content.replace("imports: [CommonModule, RouterModule],", "imports: [CommonModule, RouterModule, FormsModule],");
}

const newProps = `  isLoading = true;
  error = '';
  
  // Rating Modal
  showRateModal = false;
  orderToRate: Order | null = null;
  ratingValue = 5;
  reviewText = '';`;
  
content = content.replace("  isLoading = true;\n  error = '';", newProps);

const newMethods = `  reorder(order: Order) {
    if (confirm('Reorder these items? Note: This will clear your current cart.')) {
      this.cartService.clearCart();
      for (const item of order.items) {
        if (item.recipe) {
          for(let i=0; i<item.quantity; i++) {
             this.cartService.addToCart(item.recipe);
          }
        }
      }
      window.location.href = '/cart';
    }
  }

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
    if (!this.orderToRate || !this.orderToRate._id) return;
    this.orderService.rateOrder(this.orderToRate._id, this.ratingValue, this.reviewText).subscribe({
      next: (updatedOrder) => {
        this.showRateModal = false;
        // Update locally
        const idx = this.orders.findIndex(o => o._id === updatedOrder._id);
        if (idx !== -1) {
          this.orders[idx] = updatedOrder;
        }
      },
      error: (err) => console.error(err)
    });
  }`;
  
content = content.replace(/  reorder\(order: Order\) \{[\s\S]*?    \n  \}/, newMethods);

fs.writeFileSync(tsPath, content);
console.log('Fixed frontend orders.ts');

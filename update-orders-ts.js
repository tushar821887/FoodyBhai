const fs = require('fs');
const path = 'frontend/src/app/pages/orders/orders.ts';
let content = fs.readFileSync(path, 'utf8');

// Imports
content = content.replace(/import \{ AuthService \} from '\.\.\/\.\.\/services\/auth\.service';/, `import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';`);

// Constructor
content = content.replace(/private cdr: ChangeDetectorRef\n  \) \{\}/, `private cdr: ChangeDetectorRef,
    private router: Router,
    private cartService: CartService
  ) {}`);

// Methods
content = content.replace(/loadOrders\(\) \{/, `reorder(order: Order) {
    this.cartService.clearCart();
    order.items.forEach((item: any) => {
      if (item.recipe) {
        this.cartService.addToCart(item.recipe);
        if (item.quantity > 1) {
          this.cartService.updateQuantity(item.recipe.id, item.quantity);
        }
      }
    });
    this.router.navigate(['/cart']);
  }

  loadOrders() {`);

fs.writeFileSync(path, content);

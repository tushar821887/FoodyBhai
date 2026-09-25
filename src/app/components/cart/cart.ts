import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent {
  constructor(public cartService: CartService) {}

  closeCart() {
    this.cartService.closeCart();
  }

  increaseQuantity(item: CartItem) {
    this.cartService.updateQuantity(item.recipe.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem) {
    this.cartService.updateQuantity(item.recipe.id, item.quantity - 1);
  }

  checkout() {
    const link = this.cartService.getWhatsAppLink();
    if (link) {
      window.open(link, '_blank');
      // Optional: this.cartService.clearCart();
    }
  }
}

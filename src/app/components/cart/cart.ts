import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent {
  customerName = '';
  customerPhone = '';
  deliveryAddress = '';
  showCheckoutModal = false;

  couponInput = '';
  couponError = '';
  couponSuccess = '';

  constructor(public cartService: CartService) {}

  applyCoupon() {
    this.couponError = '';
    this.couponSuccess = '';
    
    if (this.cartService.getCurrentTotal() < 100) {
      this.couponError = 'Minimum order of ₹100 required to apply coupon.';
      return;
    }

    if (!this.couponInput.trim()) {
      this.couponError = 'Please enter a coupon code';
      return;
    }
    
    const success = this.cartService.applyCoupon(this.couponInput);
    if (success) {
      this.couponSuccess = 'Coupon applied successfully! 20% OFF';
    } else {
      this.couponError = 'Invalid coupon code';
    }
  }

  removeCoupon() {
    this.cartService.removeCoupon();
    this.couponInput = '';
    this.couponSuccess = '';
    this.couponError = '';
  }

  closeCart() {
    this.cartService.closeCart();
  }

  openCheckoutModal() {
    if (this.cartService.getCurrentTotal() < 100) {
      alert("Minimum order value is ₹100");
      return;
    }
    this.showCheckoutModal = true;
  }

  closeCheckoutModal() {
    this.showCheckoutModal = false;
  }

  increaseQuantity(item: CartItem) {
    this.cartService.updateQuantity(item.recipe.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem) {
    this.cartService.updateQuantity(item.recipe.id, item.quantity - 1);
  }

  checkout() {
    if (!this.customerName || !this.customerPhone || !this.deliveryAddress) {
      alert("Please fill in your Name, Phone Number, and Delivery Address.");
      return;
    }
    const link = this.cartService.getWhatsAppLinkWithDetails(
      this.customerName, 
      this.customerPhone, 
      this.deliveryAddress
    );
    if (link) {
      window.open(link, '_blank');
      this.cartService.clearCart();
      this.customerName = '';
      this.customerPhone = '';
      this.deliveryAddress = '';
      this.cartService.closeCart();
      this.closeCheckoutModal();
    }
  }
}

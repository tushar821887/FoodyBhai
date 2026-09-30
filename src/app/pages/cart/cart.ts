import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnDestroy {
  customerName = '';
  customerPhone = '';
  deliveryAddress = '';

  couponInput = '';
  couponError = '';
  couponSuccess = '';
  
  private authSub: Subscription;
  private currentTotal = 0;

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.customerName = user.name;
        this.customerPhone = user.email; // Phone fallback
      } else {
        this.customerName = '';
        this.customerPhone = '';
      }
    });
    
    this.cartService.finalPrice$.subscribe(total => this.currentTotal = total);
  }

  ngOnDestroy() {
    if (this.authSub) this.authSub.unsubscribe();
  }

  applyCoupon() {
    this.couponError = '';
    this.couponSuccess = '';
    
    if (this.cartService.getCurrentTotal() < 100) {
      this.couponError = 'Minimum order of ₹100 required.';
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

  increaseQuantity(item: CartItem) {
    this.cartService.updateQuantity(item.recipe.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem) {
    this.cartService.updateQuantity(item.recipe.id, item.quantity - 1);
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.recipe.id);
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

    const finishCheckout = () => {
      if (link) window.open(link, '_blank');
      this.cartService.clearCart();
      this.deliveryAddress = '';
      this.router.navigate(['/orders']); // Redirect to orders page
    };

    if (this.authService.isLoggedIn()) {
      let items: CartItem[] = [];
      this.cartService.items$.subscribe(i => items = i).unsubscribe();
      
      this.orderService.placeOrder({
        items,
        totalAmount: this.currentTotal,
        deliveryDetails: {
          name: this.customerName,
          phone: this.customerPhone,
          address: this.deliveryAddress
        }
      }).subscribe({
        next: () => finishCheckout(),
        error: (err) => {
          console.error(err);
          alert("Failed to save order to history, but we will redirect you to WhatsApp to complete it.");
          finishCheckout();
        }
      });
    } else {
      finishCheckout();
    }
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../services/order.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Rating Modal
  showRateModal = false;
  showDetailsModal = false;
  selectedOrderDetails: any = null;
  orderToRate: any = null;
  ratingValue = 5;
  reviewText = '';

  constructor(
    private orderService: OrderService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadOrders();
    } else {
      this.isLoading = false;
      this.errorMessage = 'Please login to view your order history.';
    }
  }

  reorder(order: Order) {
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

  loadOrders() {
    this.orderService.getOrderHistory().subscribe({
      next: (data) => {
        this.orders = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load order history.';
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }
  openDetailsModal(order: any) {
    this.selectedOrderDetails = order;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedOrderDetails = null;
  }

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


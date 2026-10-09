import { environment } from '../../../environments/environment';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
export class OrdersComponent implements OnInit, OnDestroy {
  orders: any[] = [];

  filterDate: string = 'all';
  filterStatus: string = 'all';
  filterPayment: string = 'all';

  get filteredOrders() {
    let result = this.orders;

    if (this.filterDate !== 'all') {
      const now = new Date();
      result = result.filter(o => {
        if (!o.createdAt) return true;
        const orderDate = new Date(o.createdAt);
        const diffTime = Math.abs(now.getTime() - orderDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (this.filterDate === 'weekly') return diffDays <= 7;
        if (this.filterDate === 'monthly') return diffDays <= 30;
        return true;
      });
    }

    if (this.filterStatus !== 'all') {
      result = result.filter(o => {
        const s = (o.status || '').toLowerCase();
        if (this.filterStatus === 'completed') return s === 'delivered' || s === 'completed';
        if (this.filterStatus === 'cancelled') return s === 'cancelled' || s === 'rejected';
        return true;
      });
    }

    if (this.filterPayment !== 'all') {
      result = result.filter(o => {
        const p = (o.paymentMethod || '').toLowerCase();
        if (this.filterPayment === 'online') return p === 'online';
        if (this.filterPayment === 'cod') return p === 'cod';
        return true;
      });
    }

    return result;
  }

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

  timerInterval: any;

  ngOnInit(): void {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    if (this.authService.isLoggedIn()) {
      this.loadOrders();
      this.timerInterval = setInterval(() => {
        this.cdr.detectChanges();
        // Poll for updates every 10 seconds
        if (new Date().getSeconds() % 10 === 0) {
          this.orderService.getOrderHistory().subscribe({
            next: (data) => {
              if (data) {
                // Check if any order changed to 'preparing'
                data.forEach((newOrder: any) => {
                  const oldOrder = this.orders.find(o => (o._id || o.id) === (newOrder._id || newOrder.id));
                  if (oldOrder && oldOrder.status !== 'preparing' && newOrder.status === 'preparing') {
                    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                      new Notification('FoodyBhai Order Update', { body: `Your order is now preparing! Ready in ${newOrder.preparationTime} minutes.` });
                    } else {
                      alert(`Your order #${(newOrder._id || newOrder.id).slice(-6).toUpperCase()} is now preparing! Ready in ${newOrder.preparationTime} minutes.`);
                    }
                  }
                });
                this.orders = data;
                // Update selected order in modal if open
                if (this.selectedOrderDetails) {
                  const updated = data.find((o: any) => (o._id || o.id) === (this.selectedOrderDetails._id || this.selectedOrderDetails.id));
                  if (updated) this.selectedOrderDetails = updated;
                }
              }
              this.cdr.detectChanges();
            }
          });
        }
      }, 1000);
    } else {
      this.isLoading = false;
      this.errorMessage = 'Please login to view your order history.';
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  getPreparationTimeRemaining(order: any): string {
    if (order.status !== 'preparing' || !order.preparationTime) return '';
    const startTime = new Date(order.updatedAt || order.createdAt).getTime();
    const targetTime = startTime + order.preparationTime * 60000;
    const now = new Date().getTime();
    const diff = targetTime - now;
    if (diff <= 0) return 'Almost ready!';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  
  downloadInvoice(orderId: string) {
    const url = `${environment.apiUrl}/orders/${orderId}/invoice`;
    window.open(url, '_blank');
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


import { environment } from '../../../environments/environment';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../services/order.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
  
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'info' = 'success';

  showNotification(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.notificationMessage = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  // Rating Modal
  showRateModal = false;
  showDetailsModal = false;
  selectedOrderDetails: any = null;
  orderToRate: any = null;
  ratingValue = 5;
  hoverRating = 0;
  reviewText = '';
  isSubmittingRating = false;
  showNotificationPermissionPrompt = false;

  // Set Password Modal for guest orders
  showSetPasswordModal = false;
  newPassword = '';
  confirmPassword = '';
  passwordError = '';
  isSettingPassword = false;

  // Guest lookup / tracking by phone or order id
  guestTrackInput = '';
  isTrackingGuest = false;
  guestTrackError = '';

  constructor(
    private orderService: OrderService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private sanitizer: DomSanitizer
  ) {}

  checkNotificationPermission(): void {
    if (typeof window !== 'undefined') {
      const alreadyHandled = localStorage.getItem('foodybhai_cust_notif_prompted') || sessionStorage.getItem('customer_notif_dismissed');
      if (alreadyHandled) {
        this.showNotificationPermissionPrompt = false;
        return;
      }
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          this.showNotificationPermissionPrompt = false;
          localStorage.setItem('foodybhai_cust_notif_prompted', 'true');
          return;
        }
        if (Notification.permission === 'default') {
          this.showNotificationPermissionPrompt = true;
        }
      }
    }
  }

  async allowNotifications(): Promise<void> {
    this.showNotificationPermissionPrompt = false;
    if (typeof window !== 'undefined') {
      localStorage.setItem('foodybhai_cust_notif_prompted', 'true');
      if ('Notification' in window) {
        try {
          const res = await Notification.requestPermission();
          if (res === 'granted') {
            localStorage.setItem('foodybhai_cust_notif_status', 'granted');
            this.showNotification('🔔 Notifications enabled! You will receive live order updates.', 'success');
          } else {
            this.showNotification('Notifications were not enabled.', 'error');
          }
        } catch (e) {}
      }
    }
    this.cdr.detectChanges();
  }

  denyNotifications(): void {
    this.showNotificationPermissionPrompt = false;
    if (typeof window !== 'undefined') {
      localStorage.setItem('foodybhai_cust_notif_prompted', 'true');
      localStorage.setItem('customer_notif_dismissed', 'true');
    }
    this.cdr.detectChanges();
  }

  private mapUrlCache = new Map<string, any>();

  getEmbeddedMapUrl(address: string) {
    if (!address) return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    if (this.mapUrlCache.has(address)) {
      return this.mapUrlCache.get(address);
    }
    
    let searchAddress = address;
    if (!searchAddress.toLowerCase().includes('meerut')) {
      searchAddress += ', Meerut, Uttar Pradesh, India';
    }
    
    // Embed a route from restaurant to the user
    const origin = encodeURIComponent('127, Bhatwara, Meerut - 250002');
    const dest = encodeURIComponent(searchAddress);
    const url = `https://maps.google.com/maps?saddr=${origin}&daddr=${dest}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.mapUrlCache.set(address, safeUrl);
    return safeUrl;
  }

  timerInterval: any;
  pollInterval: any;

  ngOnInit(): void {
    this.checkNotificationPermission();
    if (this.authService.isLoggedIn()) {
      this.loadOrders();
      this.startPolling();
    } else {
      // Check if user info is stored locally
      const storedUser = this.authService.getCurrentUser();
      if (storedUser && storedUser.phone) {
        this.guestTrackInput = storedUser.phone;
        this.trackGuestOrder();
      } else {
        this.isLoading = false;
        this.errorMessage = '';
      }
    }

    // Auto-track if query param ?track= is provided
    this.route.queryParams.subscribe(params => {
      const trackId = params['track'];
      if (trackId) {
        this.guestTrackInput = trackId;
        this.trackGuestOrder();
      }
    });
  }

  startPolling(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.pollInterval) clearInterval(this.pollInterval);

    // 1-second countdown clock for active preparing items
    this.timerInterval = setInterval(() => {
      if (this.orders && this.orders.some(o => o.status === 'preparing' && o.preparationTime)) {
        this.cdr.detectChanges();
      }
    }, 1000);

    // 10-second background sync for order status updates
    this.pollInterval = setInterval(() => {
      if (this.authService.isLoggedIn()) {
        this.orderService.getOrderHistory().subscribe({
          next: (data) => this.handleOrderUpdates(data),
          error: () => {}
        });
      } else if (this.guestTrackInput && this.orders.length > 0) {
        this.orderService.trackOrder(this.guestTrackInput.trim()).subscribe({
          next: (data) => this.handleOrderUpdates(data),
          error: () => {}
        });
      }
    }, 10000);
  }

  private handleOrderUpdates(data: any[]): void {
    if (!data) return;
    data.forEach((newOrder: any) => {
      const oldOrder = this.orders.find(o => (o._id || o.id) === (newOrder._id || newOrder.id));
      if (oldOrder && oldOrder.status !== newOrder.status) {
        let msg = '';
        if (newOrder.status === 'preparing') msg = `Your order is accepted & preparing! Ready in ${newOrder.preparationTime || 15} mins.`;
        else if (newOrder.status === 'ready') msg = `Your order is ready!`;
        else if (newOrder.status === 'out_for_delivery') msg = `Your order is out for delivery!`;
        else if (newOrder.status === 'delivered') msg = `Your order has been delivered!`;
        else if (newOrder.status === 'rejected') msg = `Your order was rejected/cancelled.`;
        
        if (msg) {
          this.showNotification(msg, newOrder.status === 'rejected' ? 'error' : 'success');
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('FoodyBhai Order Update', { body: msg });
          }
        }
      }
    });
    this.orders = data;
    if (this.selectedOrderDetails) {
      const updated = data.find((o: any) => (o._id || o.id) === (this.selectedOrderDetails._id || this.selectedOrderDetails.id));
      if (updated) this.selectedOrderDetails = updated;
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.pollInterval) clearInterval(this.pollInterval);
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
    this.isLoading = true;
    this.errorMessage = '';
    this.orderService.getOrderHistory().subscribe({
      next: (data) => {
        this.orders = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('Direct order history failed, trying fallback...', err);
        const user = this.authService.getCurrentUser();
        if (user && user.phone) {
          this.orderService.trackOrder(user.phone).subscribe({
            next: (fallbackData) => {
              this.orders = fallbackData || [];
              this.isLoading = false;
              this.errorMessage = '';
              this.cdr.detectChanges();
            },
            error: () => {
              this.errorMessage = 'Failed to load order history. Please tap Try Again.';
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.errorMessage = 'Failed to load order history. Please tap Try Again.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  trackGuestOrder() {
    if (!this.guestTrackInput.trim()) {
      this.guestTrackError = 'Please enter a Phone Number or Order ID.';
      return;
    }
    this.guestTrackError = '';
    this.isTrackingGuest = true;
    this.orderService.trackOrder(this.guestTrackInput.trim()).subscribe({
      next: (orders) => {
        this.isTrackingGuest = false;
        this.isLoading = false;
        if (orders && orders.length > 0) {
          this.orders = orders;
          this.errorMessage = '';
          this.showNotification(`Found ${orders.length} order(s)!`, 'success');
          this.startPolling();
        } else {
          this.guestTrackError = 'No orders found matching this Phone Number, Email, or Order ID.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isTrackingGuest = false;
        this.guestTrackError = 'Could not find order. Please verify your details and try again.';
        this.cdr.detectChanges();
      }
    });
  }

  openSetPasswordModal() {
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    this.showSetPasswordModal = true;
  }

  closeSetPasswordModal() {
    this.showSetPasswordModal = false;
  }

  savePassword() {
    this.passwordError = '';
    if (!this.newPassword || this.newPassword.length < 6) {
      this.passwordError = 'Password must be at least 6 characters long.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Passwords do not match.';
      return;
    }

    this.isSettingPassword = true;
    this.authService.setPassword(this.newPassword).subscribe({
      next: () => {
        this.isSettingPassword = false;
        this.showSetPasswordModal = false;
        this.showNotification('🎉 Password set successfully! You can now log in anytime.', 'success');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSettingPassword = false;
        this.passwordError = err?.error?.message || 'Failed to set password. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  cancelOrder(order: any) {
    if (!this.canCancel(order)) {
      this.showNotification('Cannot cancel order after 1 minute. Please contact support.', 'error');
      return;
    }
    const reason = prompt('Please enter a reason for cancelling this order (optional):');
    if (reason === null) return;
    
    const orderId = order._id || order.id;
    this.orderService.cancelOrder(orderId, reason).subscribe({
      next: (updatedOrder: any) => {
        const idx = this.orders.findIndex(o => (o._id || o.id) === orderId);
        if (idx !== -1) {
          this.orders[idx] = updatedOrder;
        }
        this.cdr.detectChanges();
        if (updatedOrder.cancelRequest?.status === 'pending') {
          this.showNotification('Cancellation requested. Waiting for admin approval.', 'info');
        } else {
          this.showNotification('Order cancelled successfully.', 'success');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showNotification(err?.error?.message || 'Failed to cancel order.', 'error');
        console.error(err);
      }
    });
  }

  canCancel(order: any): boolean {
    if (!order.createdAt) return false;
    const orderDate = new Date(order.createdAt).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - orderDate) / (1000 * 60);
    return diffMinutes <= 1;
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
    if (order.rating !== undefined && order.rating !== null && Number(order.rating) > 0) {
      this.showNotification('This order has already been rated and cannot be edited.', 'error');
      return;
    }
    this.orderToRate = order;
    this.ratingValue = 5;
    this.hoverRating = 0;
    this.reviewText = '';
    this.isSubmittingRating = false;
    this.showRateModal = true;
    this.cdr.detectChanges();
  }

  closeRateModal() {
    this.showRateModal = false;
    this.orderToRate = null;
    this.hoverRating = 0;
    this.cdr.detectChanges();
  }
  
  setRating(val: number) {
    this.ratingValue = val;
  }

  getRatingLabel(val: number): string {
    switch (val) {
      case 1: return 'Needs Improvement 😕';
      case 2: return 'Fair / Could Be Better 😐';
      case 3: return 'Good & Tasty 🙂';
      case 4: return 'Very Good! Delicious 😋';
      case 5: return 'Excellent! Loved It! ⭐';
      default: return '';
    }
  }
  
  submitRating() {
    if (!this.orderToRate || (!this.orderToRate._id && !this.orderToRate.id)) return;
    if (this.orderToRate.rating !== undefined && this.orderToRate.rating !== null && Number(this.orderToRate.rating) > 0) {
      this.showNotification('Rating already submitted for this order.', 'error');
      this.showRateModal = false;
      return;
    }

    const id = this.orderToRate._id || this.orderToRate.id;
    this.isSubmittingRating = true;

    this.orderService.rateOrder(id!, this.ratingValue, this.reviewText).subscribe({
      next: (updatedOrder: any) => {
        this.isSubmittingRating = false;
        this.showRateModal = false;
        
        // Update local object
        const finalRating = this.ratingValue;
        const finalReview = this.reviewText;

        if (this.orderToRate) {
          this.orderToRate.rating = finalRating;
          this.orderToRate.review = finalReview;
        }

        const idx = this.orders.findIndex((o: any) => (o._id || o.id) === id);
        if (idx !== -1) {
          this.orders[idx] = {
            ...this.orders[idx],
            ...(updatedOrder || {}),
            rating: finalRating,
            review: finalReview
          };
        }

        if (this.selectedOrderDetails && (this.selectedOrderDetails._id || this.selectedOrderDetails.id) === id) {
          this.selectedOrderDetails.rating = finalRating;
          this.selectedOrderDetails.review = finalReview;
        }

        this.showNotification('⭐ Thank you! Your rating has been recorded.', 'success');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSubmittingRating = false;
        const msg = err?.error?.message || 'Failed to submit rating';
        this.showNotification(msg, 'error');
        this.cdr.detectChanges();
      }
    });
  }
}

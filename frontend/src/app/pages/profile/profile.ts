import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { TiffinService } from '../../services/tiffin.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router, RouterModule } from '@angular/router';
import { AppUpdateService } from '../../services/app-update.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  public tiffinService = inject(TiffinService);
  user: any = null;
  orders: any[] = [];
  
  // Stats
  totalOrders = 0;
  completedOrders = 0;
  cancelledOrders = 0;
  pendingOrders = 0;

  // Tiffin Subscriptions
  subscriptions: any[] = [];
  isLoadingSubscriptions = true;
  activeSubscriptionsCount = 0;

  // Edit Subscription Modal
  isEditSubModalOpen = false;
  editingSub: any = null;
  editMealSlot: 'lunch' | 'dinner' | 'both' = 'both';
  editStreet = '';
  editArea = '';
  editLandmark = '';
  editSpecialInstructions = '';
  isSavingEditSub = false;

  areasInMeerut = [
    'Shastri Nagar',
    'Saket',
    'Budhana Gate / Bhatwara',
    'Mangal Pandey Nagar',
    'Ganga Nagar',
    'Modipuram',
    'Pallavpuram',
    'Sadar Bazaar',
    'Begum Bridge Road',
    'Medical College Road',
    'Roorkee Road',
    'Delhi Road',
    'Jagriti Vihar',
    'Civil Lines',
    'Other Area in Meerut'
  ];

  // Edit Mode
  isEditing = false;
  editData: any = {};
  message = '';
  isError = false;

  totalSpent = 0;

  // Set Password for Guest user
  profilePassword = '';
  isSavingPassword = false;
  passwordMsg = '';
  passwordMsgIsError = false;

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private http: HttpClient,
    private router: Router,
    public appUpdateService: AppUpdateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Refresh user data from API
    this.http.get<any>(`${environment.apiUrl}/users/me`, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: (u) => {
        this.user = u;
        this.initEditData();
        this.loadSubscriptions();
        this.cdr.detectChanges();
      },
      error: () => {
        this.initEditData();
        this.loadSubscriptions();
        this.cdr.detectChanges();
      }
    });

    // Initial subscriptions load from stored user
    this.loadSubscriptions();

    this.orderService.getOrderHistory().subscribe({
      next: (orders) => {
        this.orders = orders || [];
        this.calculateStats();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch orders:', err);
        this.orders = [];
        this.calculateStats();
        this.cdr.detectChanges();
      }
    });
  }

  get memberSince(): string {
    if (!this.user || !this.user.createdAt) return 'Recently';
    return new Date(this.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  getAddresses(): any[] {
    return this.user?.addresses || [];
  }

  initEditData() {
    this.editData = {
      name: this.user?.name || '',
      phone: this.user?.phone || '',
      dateOfBirth: this.user?.dateOfBirth || '',
      gender: this.user?.gender || ''
    };
  }

  calculateStats() {
    this.totalOrders = this.orders.length;
    this.completedOrders = this.orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
    this.cancelledOrders = this.orders.filter(o => o.status === 'cancelled' || o.status === 'rejected').length;
    this.pendingOrders = this.totalOrders - this.completedOrders - this.cancelledOrders;
    
    // Calculate total spent only on completed/delivered orders
    this.totalSpent = this.orders
      .filter(o => o.status === 'delivered' || o.status === 'completed')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  getPercentage(count: number): number {
    if (this.totalOrders === 0) return 0;
    return Math.round((count / this.totalOrders) * 100);
  }

  saveProfile() {
    this.http.put(`${environment.apiUrl}/users/${this.user.id}`, this.editData, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: (updatedUser: any) => {
        this.user = updatedUser;
        const current = JSON.parse(localStorage.getItem('foodybhai_user') || '{}');
        localStorage.setItem('foodybhai_user', JSON.stringify({ ...current, ...updatedUser }));
        
        this.isEditing = false;
        this.message = 'Profile updated successfully!';
        this.isError = false;
        setTimeout(() => this.message = '', 3000);
      },
      error: () => {
        this.message = 'Failed to update profile. Please try again.';
        this.isError = true;
      }
    });
  }

  saveProfilePassword() {
    if (!this.profilePassword || this.profilePassword.length < 6) {
      this.passwordMsg = 'Password must be at least 6 characters.';
      this.passwordMsgIsError = true;
      return;
    }
    this.isSavingPassword = true;
    this.authService.setPassword(this.profilePassword).subscribe({
      next: () => {
        this.isSavingPassword = false;
        this.passwordMsg = 'Password set successfully!';
        this.passwordMsgIsError = false;
        if (this.user) this.user.needsPasswordSet = false;
        this.profilePassword = '';
        this.cdr.detectChanges();
        setTimeout(() => this.passwordMsg = '', 4000);
      },
      error: (err) => {
        this.isSavingPassword = false;
        this.passwordMsg = err?.error?.message || 'Failed to set password.';
        this.passwordMsgIsError = true;
        this.cdr.detectChanges();
      }
    });
  }

  loadSubscriptions() {
    this.isLoadingSubscriptions = true;
    const rawPhone = this.user?.phone || (typeof localStorage !== 'undefined' ? localStorage.getItem('foodybhai_user_phone') : '');
    const phone = rawPhone ? rawPhone.toString().trim() : '';
    const email = this.user?.email || (typeof localStorage !== 'undefined' ? localStorage.getItem('foodybhai_user_email') : '');

    this.tiffinService.getMyOrders(phone || undefined, email || undefined).subscribe({
      next: (subs) => {
        this.subscriptions = subs || [];
        this.activeSubscriptionsCount = this.subscriptions.filter(s => s.status === 'active').length;
        this.isLoadingSubscriptions = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load tiffin subscriptions:', err);
        this.subscriptions = [];
        this.activeSubscriptionsCount = 0;
        this.isLoadingSubscriptions = false;
        this.cdr.detectChanges();
      }
    });
  }

  togglePauseSubscription(sub: any) {
    const nextStatus = sub.status === 'paused' ? 'active' : 'paused';
    const subId = sub._id || sub.orderId;
    this.tiffinService.updateOrderStatus(subId, nextStatus).subscribe({
      next: () => {
        sub.status = nextStatus;
        this.activeSubscriptionsCount = this.subscriptions.filter(s => s.status === 'active').length;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Failed to update subscription status. Please try again.');
      }
    });
  }

  cancelSubscription(sub: any) {
    const confirmCancel = confirm(
      'Are you sure you want to cancel your tiffin subscription?\n\nTip: You can pause deliveries instead if you are temporarily unavailable or going out of town.'
    );
    if (!confirmCancel) return;

    const subId = sub._id || sub.orderId;
    this.tiffinService.updateOrderStatus(subId, 'cancelled').subscribe({
      next: () => {
        sub.status = 'cancelled';
        this.activeSubscriptionsCount = this.subscriptions.filter(s => s.status === 'active').length;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Failed to cancel subscription. Please try again.');
      }
    });
  }

  openEditSubModal(sub: any) {
    this.editingSub = sub;
    this.editMealSlot = sub.mealSlot || 'both';
    this.editStreet = sub.deliveryAddress?.street || '';
    this.editArea = sub.deliveryAddress?.area || '';
    this.editLandmark = sub.deliveryAddress?.landmark || '';
    this.editSpecialInstructions = sub.specialInstructions || '';
    this.isEditSubModalOpen = true;
  }

  closeEditSubModal() {
    this.isEditSubModalOpen = false;
    this.editingSub = null;
  }

  saveSubscriptionChanges() {
    if (!this.editingSub) return;
    if (!this.editStreet.trim() || !this.editArea) {
      alert('Please provide street address and area in Meerut.');
      return;
    }

    this.isSavingEditSub = true;
    const subId = this.editingSub._id || this.editingSub.orderId;
    const updates = {
      mealSlot: this.editMealSlot,
      deliveryAddress: {
        street: this.editStreet.trim(),
        area: this.editArea,
        landmark: this.editLandmark.trim() || undefined,
        city: this.editingSub.deliveryAddress?.city || 'Meerut',
        pincode: this.editingSub.deliveryAddress?.pincode || '250002'
      },
      specialInstructions: this.editSpecialInstructions.trim() || undefined
    };

    this.tiffinService.updateOrderDetails(subId, updates).subscribe({
      next: () => {
        this.isSavingEditSub = false;
        this.editingSub.mealSlot = this.editMealSlot;
        this.editingSub.deliveryAddress = updates.deliveryAddress;
        this.editingSub.specialInstructions = updates.specialInstructions;
        this.closeEditSubModal();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSavingEditSub = false;
        alert('Failed to save subscription changes. Please try again.');
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

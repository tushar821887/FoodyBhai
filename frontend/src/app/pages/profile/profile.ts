import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  user: any = null;
  orders: any[] = [];
  
  // Stats
  totalOrders = 0;
  completedOrders = 0;
  cancelledOrders = 0;
  pendingOrders = 0;

  // Edit Mode
  isEditing = false;
  editData: any = {};
  message = '';
  isError = false;

  totalSpent = 0;

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private http: HttpClient,
    private router: Router,
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
        this.cdr.detectChanges();
      },
      error: () => {
        this.initEditData();
        this.cdr.detectChanges();
      }
    });

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
}

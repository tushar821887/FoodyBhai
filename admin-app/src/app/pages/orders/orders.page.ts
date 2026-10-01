import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterStatusPipe } from '../../pipes/filter-status.pipe';
import { FormsModule } from '@angular/forms';
import { ApiService, Order } from '../../services/api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterStatusPipe],
  templateUrl: './orders.page.html',
  styleUrl: './orders.page.css'
})
export class OrdersPage implements OnInit, OnDestroy {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  currentTab: string = 'pending'; // 'pending', 'preparing', 'completed'
  
  prepTimeInput: number = 15;
  selectedOrderId: string | null = null;
  showPrepModal = false;

  private pollInterval: any;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.fetchOrders();
    // Poll every 10 seconds
    this.pollInterval = setInterval(() => this.fetchOrders(), 10000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  fetchOrders() {
    this.api.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.filterOrders();
      },
      error: (err) => console.error('Failed to fetch orders', err)
    });
  }

  setTab(tab: string) {
    this.currentTab = tab;
    this.filterOrders();
  }

  filterOrders() {
    if (this.currentTab === 'pending') {
      this.filteredOrders = this.orders.filter(o => o.status === 'pending');
    } else if (this.currentTab === 'preparing') {
      this.filteredOrders = this.orders.filter(o => ['preparing', 'ready', 'out_for_delivery'].includes(o.status));
    } else {
      this.filteredOrders = this.orders.filter(o => ['delivered', 'cancelled', 'rejected'].includes(o.status));
    }
  }

  logout() {
    this.api.logout();
    window.location.href = '/login';
  }

  openAcceptModal(orderId: string) {
    this.selectedOrderId = orderId;
    this.prepTimeInput = 15;
    this.showPrepModal = true;
  }

  acceptOrder() {
    if (!this.selectedOrderId) return;
    this.api.updateOrderStatus(this.selectedOrderId, 'preparing', this.prepTimeInput).subscribe(() => {
      this.showPrepModal = false;
      this.fetchOrders();
    });
  }

  rejectOrder(orderId: string) {
    if(confirm('Are you sure you want to reject this order?')) {
      this.api.updateOrderStatus(orderId, 'rejected').subscribe(() => this.fetchOrders());
    }
  }

  updateStatus(orderId: string, status: string) {
    this.api.updateOrderStatus(orderId, status).subscribe(() => this.fetchOrders());
  }

  getStatusBadge(status: string) {
    const map: any = {
      pending: { label: 'New', color: '#e74c3c' },
      preparing: { label: 'Preparing', color: '#f39c12' },
      ready: { label: 'Ready', color: '#27ae60' },
      out_for_delivery: { label: 'Out for Delivery', color: '#2980b9' },
      delivered: { label: 'Delivered', color: '#7f8c8d' },
      rejected: { label: 'Rejected', color: '#c0392b' }
    };
    return map[status] || { label: status, color: '#95a5a6' };
  }
}

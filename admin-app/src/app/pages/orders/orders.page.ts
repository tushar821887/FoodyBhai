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
  currentTab: string = 'pending';
  
  prepTimeInput: number = 15;
  selectedOrderId: string | null = null;
  showPrepModal = false;

  private pollInterval: any;
  private ringAudio: HTMLAudioElement | null = null;
  private isRinging = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    try {
      this.ringAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      this.ringAudio.loop = true;
    } catch(e) {}

    this.fetchOrders();
    this.pollInterval = setInterval(() => this.fetchOrders(), 10000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.stopRinging();
  }

  fetchOrders() {
    this.api.getAllOrders().subscribe({
      next: (data) => {
        const pendingCount = data.filter(o => o.status === 'pending').length;
        
        if (pendingCount > 0 && !this.isRinging) {
          this.startRinging();
        } else if (pendingCount === 0 && this.isRinging) {
          this.stopRinging();
        }
        
        this.orders = data;
        this.filterOrders();
      },
      error: (err) => console.error('Failed to fetch orders', err)
    });
  }

  startRinging() {
    if (!this.ringAudio) return;
    this.isRinging = true;
    const playPromise = this.ringAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('Autoplay blocked. Click anywhere to allow audio.');
        this.isRinging = false; // Reset so it can try again next tick if user clicked
      });
    }
  }

  stopRinging() {
    if (!this.ringAudio) return;
    this.isRinging = false;
    this.ringAudio.pause();
    this.ringAudio.currentTime = 0;
  }

  setTab(tab: string) {
    this.currentTab = tab;
    this.filterOrders();
  }

  get activeOrdersCount() {
    return this.orders.filter(o => ['preparing', 'ready', 'out_for_delivery'].includes(o.status)).length;
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

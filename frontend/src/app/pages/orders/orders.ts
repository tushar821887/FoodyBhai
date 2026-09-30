import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private orderService: OrderService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadOrders();
    } else {
      this.isLoading = false;
      this.errorMessage = 'Please login to view your order history.';
    }
  }

  loadOrders() {
    this.orderService.getOrderHistory().subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load order history.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
}

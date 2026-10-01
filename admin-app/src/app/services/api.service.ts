import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
  _id: string;
  userId: { name: string; phone: string; email: string };
  totalAmount: number;
  deliveryDetails: { name: string; phone: string; address: string };
  status: string;
  preparationTime: number;
  paymentMethod: string;
  paymentStatus: string;
  items: any[];
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'http://localhost:3000/api'; // Or use api.foodybhai.in later

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<Order[]> {
    // Note: requires admin JWT in a real app
    return this.http.get<Order[]>(`${this.apiUrl}/orders/admin/all`);
  }

  updateOrderStatus(orderId: string, status: string, preparationTime?: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/orders/admin/${orderId}/status`, { status, preparationTime });
  }
}

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CartItem } from './cart.service';

export interface DeliveryDetails {
  name: string;
  phone: string;
  address: string;
}

export interface Order {
  _id?: string;
  id?: string;
  userId?: string;
  items: CartItem[];
  itemTotal?: number;
  discount?: number;
  gst?: number;
  platformFee?: number;
  totalAmount: number;
  deliveryDetails: DeliveryDetails;
  orderType: string;
  status: string;
  deliveryAgent?: { name: string; phone: string };
  createdAt?: string;
  rating?: number;
  review?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  placeOrder(orderData: any): Observable<Order> {
    return this.http.post<Order>(`${this.API_URL}/orders`, orderData);
  }

  getOrderHistory(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API_URL}/orders`);
  }

  rateOrder(id: string, rating: number, review: string): Observable<Order> {
    return this.http.post<Order>(`${this.API_URL}/orders/${id}/rate`, { rating, review });
  }
}

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

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
  private apiUrl = 'http://localhost:3000/api';
  private tokenKey = 'foodybhai_admin_token';
  
  private authSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.authSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.tokenKey);
      if (token) this.authSubject.next(true);
    }
  }
  
  getHeaders() {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem(this.tokenKey) || '';
    }
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((res: any) => {
        if (res.success && res.accessToken) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.tokenKey, res.accessToken);
          }
          this.authSubject.next(true);
        }
      })
    );
  }
  
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
    this.authSubject.next(false);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/admin/all`, this.getHeaders());
  }

  updateOrderStatus(orderId: string, status: string, preparationTime?: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/orders/admin/${orderId}/status`, { status, preparationTime }, this.getHeaders());
  }
}

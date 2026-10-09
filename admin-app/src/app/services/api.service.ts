import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface Order {
  _id: string;
  userId: { name: string; phone: string; email: string };
  totalAmount: number;
  deliveryDetails: { name: string; phone: string; address: string };
  status: string;
  preparationTime: number;
  paymentMethod: string;
  paymentStatus: string;
  orderType: string;
  deliveryAgent?: { name: string; phone: string };
  cancelRequest?: {
    requested: boolean;
    reason: string;
    status: string;
    requestedBy?: string;
  };
  refundStatus?: string;
  cancellationDetails?: {
    cancelledBy: string;
    reason?: string;
  };
  rating?: number;
  review?: string;
  items: any[];
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  // Settings
  getSetting(key: string) {
    return this.http.get<any>(`${this.apiUrl}/settings/${key}`);
  }
  
  saveSetting(key: string, value: any) {
    return this.http.put<any>(`${this.apiUrl}/settings/${key}`, { value }, this.getHeaders());
  }

  getCurrentUser() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const user = localStorage.getItem('admin_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }
  private apiUrl = environment.apiUrl;
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
            localStorage.setItem('admin_user', JSON.stringify(res.user));
          }
          this.authSubject.next(true);
        }
      })
    );
  }
  
  getAgents() {
    return this.http.get<Agent[]>(`${this.apiUrl}/agents`, this.getHeaders());
  }

  updateAgent(id: string, name: string, phone: string, email?: string, password?: string) {
    return this.http.put<Agent>(`${this.apiUrl}/agents/${id}`, { name, phone, email, password }, this.getHeaders());
  }

  updateAgentStatus(id: string, isActive: boolean) {
    return this.http.put<Agent>(`${this.apiUrl}/agents/${id}`, { isActive }, this.getHeaders());
  }

  addAgent(name: string, phone: string, email?: string, password?: string) {
    return this.http.post<Agent>(`${this.apiUrl}/agents`, { name, phone, email, password }, this.getHeaders());
  }

  deleteAgent(id: string) {
    return this.http.delete(`${this.apiUrl}/agents/${id}`, this.getHeaders());
  }

  // Categories
  getCategories() {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }
  addCategory(name: string, description?: string) {
    return this.http.post<any>(`${this.apiUrl}/categories`, { name, description }, this.getHeaders());
  }
  updateCategory(id: string, name: string, description?: string) {
    return this.http.put<any>(`${this.apiUrl}/categories/${id}`, { name, description }, this.getHeaders());
  }

  deleteCategory(id: string) {
    return this.http.delete(`${this.apiUrl}/categories/${id}`, this.getHeaders());
  }

  // Recipes (Items)
  getRecipes() {
    return this.http.get<any[]>(`${this.apiUrl}/recipes`);
  }
  addRecipe(data: any) {
    return this.http.post<any>(`${this.apiUrl}/recipes`, data, this.getHeaders());
  }
  updateRecipe(id: string, data: any) {
    return this.http.put<any>(`${this.apiUrl}/recipes/${id}`, data, this.getHeaders());
  }
  deleteRecipe(id: string) {
    return this.http.delete(`${this.apiUrl}/recipes/${id}`, this.getHeaders());
  }

  
  // Users

  getUsers() {
    return this.http.get<any[]>(`${this.apiUrl}/users`, this.getHeaders());
  }
  
  createUser(data: any) {
    return this.http.post<any>(`${this.apiUrl}/users`, data, this.getHeaders());
  }
  updateUser(id: string, data: any) {
    return this.http.put<any>(`${this.apiUrl}/users/${id}`, data, this.getHeaders());
  }
  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/users/${id}`, this.getHeaders());
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem('admin_user');
    }
    this.authSubject.next(false);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/admin/all`, this.getHeaders());
  }

  getRestaurantStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/orders/restaurant/stats`, this.getHeaders());
  }

  updateOrderStatus(orderId: string, status: string, preparationTime?: number, deliveryAgent?: { name: string; phone: string }, cancelReason?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/orders/admin/${orderId}/status`, { status, preparationTime, deliveryAgent, cancelReason }, this.getHeaders());
  }

  requestCancelOrder(orderId: string, reason: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/orders/agent/${orderId}/cancel-request`, { reason }, this.getHeaders());
  }

  resolveCancelOrder(orderId: string, approve: boolean, processRefund: boolean = false): Observable<any> {
    return this.http.put(`${this.apiUrl}/orders/admin/${orderId}/resolve-cancel`, { approve, processRefund }, this.getHeaders());
  }
  
  processRefund(orderId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/orders/admin/${orderId}/refund`, {}, this.getHeaders());
  }

  getContacts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/contact`, this.getHeaders());
  }
}

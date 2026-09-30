import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Recipe } from './recipe.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface CartItem {
  recipe: Recipe;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  public items$ = this.itemsSubject.asObservable();

  public totalItems$ = this.items$.pipe(
    map(items => items.reduce((total, item) => total + item.quantity, 0))
  );

  public totalPrice$ = this.items$.pipe(
    map(items => items.reduce((total, item) => total + ((item.recipe.price || 0) * item.quantity), 0))
  );

  private couponSubject = new BehaviorSubject<string>('');
  public coupon$ = this.couponSubject.asObservable();

  public discount$ = this.totalPrice$.pipe(
    map(total => this.couponSubject.value.toUpperCase() === 'FOODY20' ? Math.round(total * 0.2) : 0)
  );

  public finalPrice$ = this.totalPrice$.pipe(
    map(total => {
      const discount = this.couponSubject.value.toUpperCase() === 'FOODY20' ? Math.round(total * 0.2) : 0;
      return total - discount;
    })
  );

  private toggleSubject = new BehaviorSubject<boolean>(false);
  public isOpen$ = this.toggleSubject.asObservable();

  private readonly CART_STORAGE_KEY = 'foodybhai_cart';
  private readonly API_URL = environment.apiUrl;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private authService: AuthService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // Listen to auth state to sync cart
      this.authService.isAuthenticated$.subscribe(isAuthenticated => {
        if (isAuthenticated) {
          this.fetchRemoteCart();
        } else {
          this.loadLocalCart();
        }
      });
    }
  }

  private loadLocalCart() {
    if (!isPlatformBrowser(this.platformId)) return;
    const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
    if (savedCart) {
      try {
        this.itemsSubject.next(JSON.parse(savedCart));
      } catch(e) {
        console.error('Failed to parse cart', e);
      }
    } else {
      this.itemsSubject.next([]);
    }
  }

  private fetchRemoteCart() {
    this.http.get<{ items: CartItem[] }>(`${this.API_URL}/cart`).subscribe({
      next: (cart) => {
        const items = cart?.items || [];
        this.itemsSubject.next(items);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
        }
      },
      error: (err) => console.error('Failed to fetch remote cart', err)
    });
  }

  private syncCart(items: CartItem[]) {
    this.itemsSubject.next(items);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
    }
    
    // If logged in, sync to backend
    if (this.authService.isLoggedIn()) {
      this.http.put(`${this.API_URL}/cart`, { items }).subscribe({
        error: (err) => console.error('Failed to sync cart to server', err)
      });
    }
  }

  addToCart(recipe: Recipe) {
    const currentItems = [...this.itemsSubject.value];
    const existingIndex = currentItems.findIndex(i => i.recipe.id === recipe.id);
    
    if (existingIndex >= 0) {
      currentItems[existingIndex] = {
        ...currentItems[existingIndex],
        quantity: currentItems[existingIndex].quantity + 1
      };
    } else {
      currentItems.push({ recipe, quantity: 1 });
    }
    
    this.syncCart(currentItems);
  }

  getQuantity(recipeId: number): Observable<number> {
    return this.items$.pipe(
      map(items => {
        const item = items.find(i => i.recipe.id === recipeId);
        return item ? item.quantity : 0;
      })
    );
  }

  removeFromCart(recipeId: number) {
    const currentItems = this.itemsSubject.value.filter(i => i.recipe.id !== recipeId);
    this.syncCart(currentItems);
  }

  updateQuantity(recipeId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(recipeId);
      return;
    }
    const currentItems = [...this.itemsSubject.value];
    const existingIndex = currentItems.findIndex(i => i.recipe.id === recipeId);
    if (existingIndex >= 0) {
      currentItems[existingIndex] = {
        ...currentItems[existingIndex],
        quantity
      };
      this.syncCart(currentItems);
    }
  }

  getCurrentTotal(): number {
    return this.itemsSubject.value.reduce((total, item) => total + ((item.recipe.price || 0) * item.quantity), 0);
  }

  applyCoupon(code: string): boolean {
    if (code.toUpperCase() === 'FOODY20') {
      this.couponSubject.next(code);
      this.itemsSubject.next([...this.itemsSubject.value]); // Trigger recalculation
      return true;
    }
    return false;
  }
  
  removeCoupon() {
    this.couponSubject.next('');
    this.itemsSubject.next([...this.itemsSubject.value]);
  }

  clearCart() {
    this.syncCart([]);
  }

  openCart() {
    this.toggleSubject.next(true);
  }

  closeCart() {
    this.toggleSubject.next(false);
  }

  getWhatsAppLink(): string {
    return this.getWhatsAppLinkWithDetails('N/A', 'N/A', 'N/A');
  }

  getWhatsAppLinkWithDetails(name: string, phone: string, address: string): string {
    const items = this.itemsSubject.value;
    if (items.length === 0) return '';
    
    let text = `Hello Foody Bhai! I would like to place an order.\n\n`;
    text += `*Delivery Details:*\n`;
    text += `Name: ${name}\n`;
    text += `Phone: ${phone}\n`;
    text += `Address: ${address}\n\n`;
    text += `*Order Items:*\n`;
    
    let total = 0;
    items.forEach(item => {
      const itemTotal = (item.recipe.price || 0) * item.quantity;
      total += itemTotal;
      text += `- ${item.quantity}x ${item.recipe.title} (₹${itemTotal})\n`;
    });
    
    const coupon = this.couponSubject.value.toUpperCase();
    if (coupon === 'FOODY20') {
        const discount = Math.round(total * 0.2);
        const finalTotal = total - discount;
        text += `\nSubtotal: ₹${total}`;
        text += `\nDiscount (FOODY20): -₹${discount}`;
        text += `\n*Total to Pay: ₹${finalTotal}*`;
    } else {
        text += `\n*Total to Pay: ₹${total}*`;
    }
    
    return `https://wa.me/918218870579?text=${encodeURIComponent(text)}`;
  }
}


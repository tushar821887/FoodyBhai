import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { BehaviorSubject, map, Observable } from 'rxjs';
import { Recipe } from './recipe.service';

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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      if (savedCart) {
        try {
          this.itemsSubject.next(JSON.parse(savedCart));
        } catch(e) {
          console.error('Failed to parse cart', e);
        }
      }
      
      this.items$.subscribe(items => {
        localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
      });
    }
  }

  addToCart(recipe: Recipe) {
    const currentItems = this.itemsSubject.value;
    const existing = currentItems.find(i => i.recipe.id === recipe.id);
    
    if (existing) {
      existing.quantity += 1;
      this.itemsSubject.next([...currentItems]);
    } else {
      this.itemsSubject.next([...currentItems, { recipe, quantity: 1 }]);
    }
    
    // Auto-open is disabled per user request
    // this.openCart();
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
    const currentItems = this.itemsSubject.value;
    this.itemsSubject.next(currentItems.filter(i => i.recipe.id !== recipeId));
  }

  updateQuantity(recipeId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(recipeId);
      return;
    }
    const currentItems = this.itemsSubject.value;
    const existing = currentItems.find(i => i.recipe.id === recipeId);
    if (existing) {
      existing.quantity = quantity;
      this.itemsSubject.next([...currentItems]);
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
    this.itemsSubject.next([]);
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
    
    let text = `Hello Foody Bhai! I would like to place an order.

`;
    text += `*Delivery Details:*
`;
    text += `Name: ${name}
`;
    text += `Phone: ${phone}
`;
    text += `Address: ${address}

`;
    text += `*Order Items:*
`;
    
    let total = 0;
    items.forEach(item => {
      const itemTotal = (item.recipe.price || 0) * item.quantity;
      total += itemTotal;
      text += `- ${item.quantity}x ${item.recipe.title} (₹${itemTotal})
`;
    });
    
    const coupon = this.couponSubject.value.toUpperCase();
    if (coupon === 'FOODY20') {
        const discount = Math.round(total * 0.2);
        const finalTotal = total - discount;
        text += `
Subtotal: ₹${total}`;
        text += `
Discount (FOODY20): -₹${discount}`;
        text += `
*Total to Pay: ₹${finalTotal}*`;
    } else {
        text += `
*Total to Pay: ₹${total}*`;
    }
    
    return `https://wa.me/918218870579?text=${encodeURIComponent(text)}`;
  }
}

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, combineLatest, tap } from 'rxjs';
import { Recipe } from './recipe.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface CartItem {
  recipe: Recipe;
  quantity: number;
}

export interface CartOffersConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  buttonText: string;
  displayMode: 'popup' | 'chips' | 'both';
  maxOffersToShow: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  public isOffline$ = new BehaviorSubject<boolean>(false);
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  public items$ = this.itemsSubject.asObservable();

  public totalItems$ = this.items$.pipe(
    map(items => (items && Array.isArray(items)) ? items.length : 0)
  );

  public totalQuantity$ = this.items$.pipe(
    map(items => (items && Array.isArray(items)) ? items.reduce((total, item) => total + (item.quantity || 1), 0) : 0)
  );

  public totalPrice$ = this.items$.pipe(
    map(items => {
      if (!items || !Array.isArray(items)) return 0;
      return items.reduce((total, item) => {
        if (!item || !item.recipe) return total;
        return total + ((item.recipe.price || 0) * item.quantity);
      }, 0);
    })
  );

  private couponSubject = new BehaviorSubject<string>('');
  public coupon$ = this.couponSubject.asObservable();

  private appliedDiscountSubject = new BehaviorSubject<number>(0);
  public appliedDiscount$ = this.appliedDiscountSubject.asObservable();

  private appliedCouponDetailsSubject = new BehaviorSubject<any>(null);
  public appliedCouponDetails$ = this.appliedCouponDetailsSubject.asObservable();

  public discount$ = combineLatest([this.totalPrice$, this.appliedCouponDetailsSubject, this.appliedDiscountSubject]).pipe(
    map(([total, details, directDiscount]) => {
      if (!details || total === 0) return 0;
      if (details.minOrderAmount && total < details.minOrderAmount) {
        return 0; // Cart total doesn't satisfy coupon minimum requirement
      }
      if (details.discountType === 'percentage') {
        let disc = (total * (details.discountValue || 0)) / 100;
        if (details.maxDiscount && details.maxDiscount > 0) {
          disc = Math.min(disc, details.maxDiscount);
        }
        return Math.round(disc);
      } else {
        return Math.min(details.discountValue || directDiscount || 0, total);
      }
    })
  );

  public gstPercent$ = new BehaviorSubject<number>(5);
  public dynamicPlatformFee$ = new BehaviorSubject<number>(5);
  public dynamicDeliveryFee$ = new BehaviorSubject<number>(0);
  public freeDeliveryMinAmount$ = new BehaviorSubject<number>(0);
  public cartOffersConfig$ = new BehaviorSubject<CartOffersConfig>({
    enabled: true,
    title: 'Available Offers',
    subtitle: 'Tap to view coupons & deals',
    buttonText: 'View Offers',
    displayMode: 'popup',
    maxOffersToShow: 5
  });

  public deliveryFee$ = combineLatest([this.totalPrice$, this.dynamicDeliveryFee$, this.freeDeliveryMinAmount$]).pipe(
    map(([total, fee, minFree]) => {
      if (total === 0) return 0;
      if (minFree > 0 && total >= minFree) return 0;
      return fee;
    })
  );

  public platformFee$ = combineLatest([this.totalPrice$, this.dynamicPlatformFee$]).pipe(
    map(([total, fee]) => (total > 0 ? fee : 0))
  );

  public gst$ = combineLatest([this.totalPrice$, this.gstPercent$]).pipe(
    map(([total, percent]) => (total > 0 ? Math.round((total * percent) / 100) : 0))
  );

  public finalPrice$ = combineLatest([this.totalPrice$, this.discount$, this.platformFee$, this.gst$, this.deliveryFee$]).pipe(
    map(([total, discount, fee, gst, delivery]) => {
      if (total === 0) return 0;
      return Math.max(0, total - discount + fee + gst + (delivery || 0));
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
      this.checkOfflineStatus();
      this.loadTaxAndFeeSettings();
      setInterval(() => this.checkOfflineStatus(), 30000);
      setInterval(() => this.loadTaxAndFeeSettings(), 60000);
      // Listen to auth state to sync cart
      this.authService.isAuthenticated$.subscribe(isAuthenticated => {
        if (isAuthenticated) {
          // If logged in, get current local items and merge them with remote cart
          const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
          let localItems: CartItem[] = [];
          if (savedCart) {
            try {
              localItems = JSON.parse(savedCart);
            } catch (e) {}
          }
          this.fetchAndMergeCart(localItems);
        } else {
          this.loadLocalCart();
        }
      });
    }
  }

  private checkOfflineStatus() {
    this.http.get<any>(`${this.API_URL}/settings/restaurant_open`).subscribe({
      next: (res) => {
        if (res && res.value !== undefined) {
          const isOpen = res.value === 'true' || res.value === true;
          this.isOffline$.next(!isOpen);
        }
      },
      error: () => {}
    });
  }

  public loadTaxAndFeeSettings() {
    this.http.get<any>(`${this.API_URL}/settings/tax_gst_percent`).subscribe({
      next: (res) => {
        if (res && res.value !== undefined && res.value !== null && res.value !== '') {
          this.gstPercent$.next(Number(res.value) || 0);
        }
      },
      error: () => {}
    });

    this.http.get<any>(`${this.API_URL}/settings/platform_fee`).subscribe({
      next: (res) => {
        if (res && res.value !== undefined && res.value !== null && res.value !== '') {
          this.dynamicPlatformFee$.next(Number(res.value) || 0);
        }
      },
      error: () => {}
    });

    this.http.get<any>(`${this.API_URL}/settings/delivery_fee`).subscribe({
      next: (res) => {
        if (res && res.value !== undefined && res.value !== null && res.value !== '') {
          this.dynamicDeliveryFee$.next(Number(res.value) || 0);
        }
      },
      error: () => {}
    });

    this.http.get<any>(`${this.API_URL}/settings/free_delivery_min_amount`).subscribe({
      next: (res) => {
        if (res && res.value !== undefined && res.value !== null && res.value !== '') {
          this.freeDeliveryMinAmount$.next(Number(res.value) || 0);
        }
      },
      error: () => {}
    });

    this.http.get<any>(`${this.API_URL}/settings/cart_offers_config`).subscribe({
      next: (res) => {
        if (res && res.value !== undefined && res.value !== null) {
          try {
            const val = typeof res.value === 'string' ? JSON.parse(res.value) : res.value;
            this.cartOffersConfig$.next({
              enabled: val.enabled !== undefined ? Boolean(val.enabled) : true,
              title: val.title || 'Available Offers',
              subtitle: val.subtitle || 'Tap to view coupons & deals',
              buttonText: val.buttonText || 'View Offers',
              displayMode: val.displayMode || 'popup',
              maxOffersToShow: Number(val.maxOffersToShow) || 5
            });
          } catch (e) {}
        }
      },
      error: () => {}
    });
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

  private fetchAndMergeCart(localItems: CartItem[]) {
    this.http.get<{ items: CartItem[] }>(`${this.API_URL}/cart`).subscribe({
      next: (cart) => {
        let mergedItems = [...(cart?.items || [])];
        
        // Merge local items into remote items
        for (const localItem of localItems) {
          if (!localItem || !localItem.recipe) continue;
          const existingIndex = mergedItems.findIndex(i => i && i.recipe && (i.recipe.id || i.recipe._id) == (localItem.recipe.id || localItem.recipe._id));
          if (existingIndex >= 0) {
            // Take the max quantity to prevent doubling when local and remote carts are already synced
            mergedItems[existingIndex].quantity = Math.max(mergedItems[existingIndex].quantity, localItem.quantity);
          } else {
            mergedItems.push(localItem);
          }
        }
        
        // Sync merged cart (this will update UI, localStorage, and backend)
        this.syncCart(mergedItems);
      },
      error: (err) => console.error('Failed to fetch and merge cart', err)
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
    if (this.isOffline$.value) {
      alert("We are currently offline and not accepting orders.");
      return;
    }
    if (recipe.inStock === false) {
      alert(`"${recipe.title}" is currently out of stock.`);
      return;
    }
    const currentItems = [...this.itemsSubject.value];
    const existingIndex = currentItems.findIndex(i => (i.recipe.id || i.recipe._id) == (recipe.id || recipe._id));
    
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

  addItemsToCart(recipe: Recipe, quantity: number = 1): boolean {
    if (this.isOffline$.value || recipe.inStock === false) {
      return false;
    }
    const qty = Math.max(1, Math.floor(quantity) || 1);
    const currentItems = [...this.itemsSubject.value];
    const existingIndex = currentItems.findIndex(i => (i.recipe.id || i.recipe._id) == (recipe.id || recipe._id));
    
    if (existingIndex >= 0) {
      currentItems[existingIndex] = {
        ...currentItems[existingIndex],
        quantity: currentItems[existingIndex].quantity + qty
      };
    } else {
      currentItems.push({ recipe, quantity: qty });
    }
    
    this.syncCart(currentItems);
    return true;
  }

  getQuantity(recipeId: number): Observable<number> {
    return this.items$.pipe(
      map(items => {
        if (!items || !Array.isArray(items)) return 0;
        const item = items.find(i => i && i.recipe && (i.recipe.id || i.recipe._id) == recipeId);
        return item ? item.quantity : 0;
      })
    );
  }

  removeFromCart(recipeId: number) {
    const currentItems = this.itemsSubject.value.filter(i => i && i.recipe && (i.recipe.id || i.recipe._id) != recipeId);
    this.syncCart(currentItems);
  }

  updateQuantity(recipeId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(recipeId);
      return;
    }
    const currentItems = [...this.itemsSubject.value];
    const existingIndex = currentItems.findIndex(i => i && i.recipe && (i.recipe.id || i.recipe._id) == recipeId);
    if (existingIndex >= 0) {
      if (quantity > currentItems[existingIndex].quantity && currentItems[existingIndex].recipe?.inStock === false) {
        alert(`"${currentItems[existingIndex].recipe.title}" is currently out of stock.`);
        return;
      }
      currentItems[existingIndex] = {
        ...currentItems[existingIndex],
        quantity
      };
      this.syncCart(currentItems);
    }
  }

  getItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  getCurrentTotal(): number {
    const items = this.itemsSubject.value;
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      if (!item || !item.recipe) return total;
      return total + ((item.recipe.price || 0) * item.quantity);
    }, 0);
  }

  getCouponCode(): string {
    return this.couponSubject.value;
  }

  validateAndApplyCoupon(code: string, orderAmount: number, userId?: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/coupons/validate`, {
      code: (code || '').trim().toUpperCase(),
      orderAmount,
      userId
    }).pipe(
      tap((res) => {
        if (res && res.valid) {
          const couponCode = res.coupon?.code || code.trim().toUpperCase();
          this.couponSubject.next(couponCode);
          this.appliedDiscountSubject.next(res.discount || 0);
          this.appliedCouponDetailsSubject.next(res.coupon || {
            code: couponCode,
            discountValue: res.discount || 0,
            discountType: 'flat'
          });
          this.itemsSubject.next([...this.itemsSubject.value]);
        } else {
          this.removeCoupon();
        }
      })
    );
  }

  getActivePublicCoupons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/coupons/active`);
  }

  removeCoupon() {
    this.couponSubject.next('');
    this.appliedDiscountSubject.next(0);
    this.appliedCouponDetailsSubject.next(null);
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
    let discount = 0;
    const details = this.appliedCouponDetailsSubject.value;
    if (details && total > 0 && (!details.minOrderAmount || total >= details.minOrderAmount)) {
      if (details.discountType === 'percentage') {
        let d = (total * (details.discountValue || 0)) / 100;
        if (details.maxDiscount && details.maxDiscount > 0) d = Math.min(d, details.maxDiscount);
        discount = Math.round(d);
      } else {
        discount = Math.min(details.discountValue || 0, total);
      }
    } else {
      discount = this.appliedDiscountSubject.value || 0;
    }

    const feeRate = this.dynamicPlatformFee$.value;
    const gstRate = this.gstPercent$.value;
    const platformFee = total > 0 ? feeRate : 0;
    const gst = total > 0 ? Math.round((total * gstRate) / 100) : 0;
    const finalTotal = Math.max(0, total - discount + platformFee + gst);
    
    text += `\nSubtotal: ₹${total}`;
    if (discount > 0) text += `\nDiscount (${coupon || 'Promo'}): -₹${discount}`;
    if (gst > 0) text += `\nGST (${gstRate}%): ₹${gst}`;
    if (platformFee > 0) text += `\nPlatform Fee: ₹${platformFee}`;
    text += `\n*Total to Pay: ₹${finalTotal}*`;
    
    return `https://wa.me/918218870579?text=${encodeURIComponent(text)}`;
  }
}


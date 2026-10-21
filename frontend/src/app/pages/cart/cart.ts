import { Component, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService, Address } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { Subscription } from 'rxjs';

export interface UpiAppInfo {
  id: string;
  name: string;
  packageName: string;
  badge?: string;
  color: string;
  bgColor: string;
  description: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnDestroy {
  customerName = '';
  customerPhone = '';
  customerEmail = '';
  orderType: 'delivery' | 'pickup' = 'delivery';

  // Address properties
  deliveryAddress = '';
  savedAddresses: Address[] = [];
  selectedAddressId: string | null = null;
  showNewAddressForm = false;
  newAddressLabel = 'Home';
  newAddressText = '';
  isAddingAddress = false;

  couponInput = '';
  couponError = '';
  couponSuccess = '';

  private authSub: Subscription;
  currentTotal = 0;

  // --- Payment Modal ---
  showPaymentModal = false;
  paymentMethod: 'online' | 'cod' = 'online';
  codConfirmed = false;
  qrImageUrl = '';
  upiId = '';
  selectedQrMode: 'dynamic' | 'uploaded' = 'dynamic';

  get hasCustomUploadedQr(): boolean {
    return !!(this.qrImageUrl && !this.qrImageUrl.includes('wikimedia.org'));
  }
  
  get effectiveUpiId(): string {
    return this.upiId || '8218870579@ptyes';
  }

  get upiPaymentString(): string {
    const upi = this.effectiveUpiId;
    const amount = Number(this.currentTotal).toFixed(2);
    return `upi://pay?pa=${upi}&pn=FoodyBhai&am=${amount}&cu=INR&tn=FoodyBhaiOrder`;
  }

  get dynamicQrUrl(): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(this.upiPaymentString)}`;
  }

  // --- UPI Apps Selector ---
  showUpiAppsModal = false;
  selectedUpiApp: UpiAppInfo | null = null;

  readonly upiApps: UpiAppInfo[] = [
    {
      id: 'gpay',
      name: 'Google Pay',
      packageName: 'com.google.android.apps.nbu.paisa.user',
      badge: 'Popular',
      color: '#1a73e8',
      bgColor: '#e8f0fe',
      description: 'Fast UPI payments with Google Pay'
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      packageName: 'com.phonepe.app',
      badge: 'Popular',
      color: '#5f259f',
      bgColor: '#f3e8ff',
      description: 'UPI, Wallet & instant bank transfers'
    },
    {
      id: 'paytm',
      name: 'Paytm UPI',
      packageName: 'net.one97.paytm',
      badge: 'Fast',
      color: '#002970',
      bgColor: '#e0f2fe',
      description: 'Instant payment via Paytm app'
    },
    {
      id: 'bhim',
      name: 'BHIM UPI',
      packageName: 'in.org.npci.upiapp',
      badge: 'NPCI',
      color: '#00843d',
      bgColor: '#dcfce7',
      description: 'Govt. of India official UPI app'
    },
    {
      id: 'cred',
      name: 'CRED UPI',
      packageName: 'com.dreamplug.androidapp',
      badge: 'Rewards',
      color: '#111827',
      bgColor: '#f3f4f6',
      description: 'Pay using CRED UPI & earn rewards'
    },
    {
      id: 'amazonpay',
      name: 'Amazon Pay',
      packageName: 'in.amazon.mShop.android.shopping',
      color: '#ea580c',
      bgColor: '#ffedd5',
      description: 'Amazon Pay UPI balance & bank'
    },
    {
      id: 'any',
      name: 'Other UPI Apps',
      packageName: '',
      badge: 'All Apps',
      color: '#e11d48',
      bgColor: '#ffe4e6',
      description: 'Open Android system chooser for all installed UPI apps'
    }
  ];

  openUpiAppsModal() {
    this.showUpiAppsModal = true;
  }

  closeUpiAppsModal() {
    this.showUpiAppsModal = false;
  }

  getUpiQueryString(): string {
    const upi = this.effectiveUpiId;
    const amount = Number(this.currentTotal).toFixed(2);
    const tr = 'FB' + Date.now();
    return `pa=${encodeURIComponent(upi)}&pn=FoodyBhai&am=${amount}&cu=INR&tn=FoodyBhaiOrder&tr=${tr}`;
  }

  getAppUpiLink(appId: string): string {
    const query = this.getUpiQueryString();
    const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

    switch (appId) {
      case 'gpay':
        return isAndroid
          ? `intent://pay?${query}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`
          : `tez://upi/pay?${query}`;
      case 'phonepe':
        return isAndroid
          ? `intent://pay?${query}#Intent;scheme=upi;package=com.phonepe.app;end`
          : `phonepe://pay?${query}`;
      case 'paytm':
        return isAndroid
          ? `intent://pay?${query}#Intent;scheme=upi;package=net.one97.paytm;end`
          : `paytmmp://pay?${query}`;
      case 'bhim':
        return isAndroid
          ? `intent://pay?${query}#Intent;scheme=upi;package=in.org.npci.upiapp;end`
          : `upi://pay?${query}`;
      case 'cred':
        return isAndroid
          ? `intent://pay?${query}#Intent;scheme=upi;package=com.dreamplug.androidapp;end`
          : `credpay://pay?${query}`;
      case 'amazonpay':
        return isAndroid
          ? `intent://pay?${query}#Intent;scheme=upi;package=in.amazon.mShop.android.shopping;end`
          : `upi://pay?${query}`;
      case 'any':
      default:
        return `upi://pay?${query}`;
    }
  }

  onAppSelected(app: UpiAppInfo) {
    this.selectedUpiApp = app;
    this.showUpiAppsModal = false;
    this.showToast(`Opening ${app.name}... Please complete payment and tap "I've Paid".`, 'info');
  }

  copyUpiId() {
    const upi = this.effectiveUpiId;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(upi).then(() => {
        this.showToast('UPI ID copied: ' + upi, 'success');
      }).catch(() => {
        this.showToast('UPI ID: ' + upi, 'info');
      });
    } else {
      this.showToast('UPI ID: ' + upi, 'info');
    }
  }

  restaurantOpen = true;
  restaurantClosedReason = '';
  isPlacingOrder = false;

  // --- Toast Notification ---
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'success';
  toastVisible = false;
  private toastTimer: any;

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    public authService: AuthService, private cdr: ChangeDetectorRef,
    public uiService: UiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (this.authService.isLoggedIn()) {
      this.authService.fetchProfile().subscribe();
    }

    this.authSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.customerName = user.name;
        this.customerPhone = user.phone || '';
        this.customerEmail = user.email || '';
        this.savedAddresses = user.addresses || [];
        if (this.savedAddresses.length > 0 && !this.selectedAddressId) {
          this.selectedAddressId = this.savedAddresses[0].id || null;
        } else if (this.savedAddresses.length === 0) {
          this.selectedAddressId = null;
        }
      } else {
        this.customerName = '';
        this.customerPhone = '';
        this.customerEmail = '';
        this.savedAddresses = [];
        this.selectedAddressId = null;
      }
    });

    this.cartService.finalPrice$.subscribe(total => this.currentTotal = total);

    // Load QR & UPI from localStorage (set by admin)
    if (isPlatformBrowser(this.platformId)) {
      this.orderService.getSetting('foodybhai_qr').subscribe(res => { if (res && res.value !== undefined) { this.qrImageUrl = res.value; this.cdr.detectChanges(); } });
      this.orderService.getSetting('restaurant_open').subscribe(res => { if (res && res.value !== undefined) { this.restaurantOpen = res.value === 'true' || res.value === true; this.cdr.detectChanges(); } });
      this.orderService.getSetting('restaurant_closed_reason').subscribe(res => { if (res && res.value !== undefined) { this.restaurantClosedReason = res.value; this.cdr.detectChanges(); } });
      this.orderService.getSetting('foodybhai_upi').subscribe(res => { if (res && res.value !== undefined) { this.upiId = res.value; this.cdr.detectChanges(); } });
      
      
    }
  }

  ngOnDestroy() {
    if (this.authSub) this.authSub.unsubscribe();
    clearTimeout(this.toastTimer);
  }

  // --- Toast ---
  showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 4000);
  }

  // --- Coupon ---
  applyCoupon() {
    this.couponError = '';
    this.couponSuccess = '';
    if (this.cartService.getCurrentTotal() < 100) {
      this.couponError = 'Minimum order of ₹100 required.';
      return;
    }
    if (!this.couponInput.trim()) {
      this.couponError = 'Please enter a coupon code';
      return;
    }
    const success = this.cartService.applyCoupon(this.couponInput);
    if (success) {
      this.couponSuccess = 'Coupon applied! 20% OFF';
    } else {
      this.couponError = 'Invalid coupon code';
    }
  }

  removeCoupon() {
    this.cartService.removeCoupon();
    this.couponInput = '';
    this.couponSuccess = '';
    this.couponError = '';
  }

  // --- Cart Quantity ---
  increaseQuantity(item: CartItem) {
    this.cartService.updateQuantity(item.recipe.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem) {
    this.cartService.updateQuantity(item.recipe.id, item.quantity - 1);
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.recipe.id);
  }

  // --- Stepper ---
  currentStep = 1;

  setStep(step: number) {
    if (step > 1) {
      const outOfStockItem = this.cartService.getItems().find(i => i.recipe?.inStock === false);
      if (outOfStockItem) {
        this.showToast(`"${outOfStockItem.recipe.title}" is currently out of stock. Please remove it from your cart to proceed.`, 'error');
        return;
      }
    }
    if (step === 2 && this.cartService.getCurrentTotal() < 100) {
      this.showToast('Minimum order of ₹100 required.', 'error');
      return;
    }
    if (step === 3) {
      if (!this.customerName || !this.customerPhone) {
        this.showToast('Please fill in your Name and Phone Number.', 'error');
        return;
      }
      if (this.orderType === 'delivery') {
        if (this.authService.isLoggedIn() && !this.selectedAddressId && this.savedAddresses.length > 0) {
          this.showToast('Please select a delivery address.', 'error');
          return;
        }
        if (!this.authService.isLoggedIn() && !this.deliveryAddress) {
          this.showToast('Please provide a delivery address.', 'error');
          return;
        }
      }
    }
    if (step < this.currentStep || step === this.currentStep + 1) {
      this.currentStep = step;
    }
  }

  nextStep() { this.setStep(this.currentStep + 1); }
  prevStep() { this.setStep(this.currentStep - 1); }

  // --- Address Modal ---
  isAddressModalOpen = false;
  activeModalTab: 'saved' | 'new' = 'saved';

  get selectedAddress() {
    return this.savedAddresses.find(a => a.id === this.selectedAddressId) || null;
  }

  openAddressModal() {
    this.isAddressModalOpen = true;
    this.activeModalTab = this.savedAddresses.length > 0 ? 'saved' : 'new';
  }

  closeAddressModal() { this.isAddressModalOpen = false; }

  switchModalTab(tab: 'saved' | 'new') { this.activeModalTab = tab; }

  selectAddress(id: string | undefined) {
    if (id) {
      this.selectedAddressId = id;
      this.closeAddressModal();
    }
  }

  saveNewAddress() {
    if (!this.newAddressLabel || !this.newAddressText) return;
    
    let addressToSave = this.newAddressText;
    if (!addressToSave.toLowerCase().includes('meerut')) {
      addressToSave += ', Meerut, Uttar Pradesh';
    }
    
    this.isAddingAddress = true;
    this.authService.addAddress({ label: this.newAddressLabel, fullAddress: addressToSave }).subscribe({
      next: (user) => {
        this.isAddingAddress = false;
        this.newAddressText = '';
        if (user.addresses && user.addresses.length > 0) {
          const added = user.addresses[user.addresses.length - 1];
          this.selectedAddressId = added.id || null;
          this.closeAddressModal();
        }
      },
      error: () => {
        this.isAddingAddress = false;
        this.showToast('Failed to save address. Please try again.', 'error');
      }
    });
  }

  deleteAddress(id: string | undefined, event: Event) {
    event.stopPropagation();
    if (!id) return;
    this.authService.deleteAddress(id).subscribe();
  }

  // --- Checkout: open Payment Modal ---
  checkout() {
    // Allow guest checkout
    // Validate address
    if (this.orderType === 'delivery') {
      if (this.savedAddresses.length > 0 && !this.selectedAddressId) {
        this.showToast('Please select a delivery address.', 'error');
        return;
      }
      if (!this.authService.isLoggedIn() && !this.deliveryAddress) {
        this.showToast('Please provide a delivery address.', 'error');
        return;
      }
    }
    if (!this.customerName || !this.customerPhone) {
      this.showToast('Please fill in your Name and Phone Number.', 'error');
      return;
    }
    // Open payment modal
    this.paymentMethod = 'online';
    this.selectedQrMode = 'dynamic';
    this.codConfirmed = false;
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.showUpiAppsModal = false;
  }

  confirmPaymentAndPlaceOrder() {
    if (this.paymentMethod === 'cod' && !this.codConfirmed) {
      this.showToast('Please confirm you will pay cash on delivery.', 'error');
      return;
    }

    let finalAddress = this.deliveryAddress;
    if (this.orderType === 'delivery') {
      const selected = this.savedAddresses.find(a => a.id === this.selectedAddressId);
      if (selected) {
        finalAddress = selected.fullAddress;
      } else if (!finalAddress.toLowerCase().includes('meerut')) {
        finalAddress += ', Meerut, Uttar Pradesh';
      }
    } else {
      finalAddress = 'Self Pickup — 226 Bhatwara, Budhana Gate, Meerut';
    }

    let items: CartItem[] = [];
    this.cartService.items$.subscribe(i => items = i).unsubscribe();

    this.isPlacingOrder = true;
    let itemTotal = 0, discount = 0, gst = 0, platformFee = 0;
    this.cartService.totalPrice$.subscribe(v => itemTotal = v).unsubscribe();
    this.cartService.discount$.subscribe(v => discount = v).unsubscribe();
    this.cartService.gst$.subscribe(v => gst = v).unsubscribe();
    this.cartService.platformFee$.subscribe(v => platformFee = v).unsubscribe();

    if (this.cartService.isOffline$.value) {
      this.showToast("We are currently offline and not accepting orders.", 'error');
      return;
    }

    const outOfStock = items.find(i => i.recipe?.inStock === false);
    if (outOfStock) {
      this.isPlacingOrder = false;
      this.showToast(`"${outOfStock.recipe.title}" is out of stock. Please remove it from your cart.`, 'error');
      return;
    }

    this.orderService.placeOrder({
      items,
      itemTotal,
      discount,
      gst,
      platformFee,
      totalAmount: this.currentTotal,
      orderType: this.orderType,
      paymentMethod: this.paymentMethod,
      deliveryDetails: {
        name: this.customerName,
        phone: this.customerPhone,
        address: finalAddress,
        email: this.customerEmail || undefined
      }
    }).subscribe({
      next: (orderRes: any) => {
        if (orderRes?.guestAuth?.accessToken && orderRes?.guestAuth?.user) {
          this.authService.setAuth(orderRes.guestAuth.accessToken, orderRes.guestAuth.user);
        }
        this.isPlacingOrder = false;
        this.showPaymentModal = false;
        this.cartService.clearCart();
        this.deliveryAddress = '';
        this.showToast('🎉 Order placed successfully! We\'ll start preparing your food.', 'success');
        const trackId = orderRes?._id || orderRes?.id;
        const targetUrl = trackId ? `/orders?track=${trackId}` : '/orders';
        setTimeout(() => this.router.navigateByUrl(targetUrl), 1500);
      },
      error: (err) => {
        if (err.error && err.error.message && err.error.message.includes('offline')) {
           this.showToast(err.error.message, 'error');
        }
        this.isPlacingOrder = false;
        console.error(err);
        this.showToast('Failed to place order. Please try again.', 'error');
      }
    });
  }
}

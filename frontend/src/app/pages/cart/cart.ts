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
  upiId = 'foodybhai@okaxis';
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
        this.customerPhone = user.email;
        this.savedAddresses = user.addresses || [];
        if (this.savedAddresses.length > 0 && !this.selectedAddressId) {
          this.selectedAddressId = this.savedAddresses[0].id || null;
        } else if (this.savedAddresses.length === 0) {
          this.selectedAddressId = null;
        }
      } else {
        this.customerName = '';
        this.customerPhone = '';
        this.savedAddresses = [];
        this.selectedAddressId = null;
      }
    });

    this.cartService.finalPrice$.subscribe(total => this.currentTotal = total);

    // Load QR & UPI from localStorage (set by admin)
    if (isPlatformBrowser(this.platformId)) {
      this.orderService.getSetting('foodybhai_qr').subscribe(res => { if (res && res.value) { this.qrImageUrl = res.value; this.cdr.detectChanges(); } });
      this.orderService.getSetting('restaurant_open').subscribe(res => { if (res && res.value !== undefined) { this.restaurantOpen = res.value === 'true' || res.value === true; this.cdr.detectChanges(); } });
      this.orderService.getSetting('restaurant_closed_reason').subscribe(res => { if (res && res.value) { this.restaurantClosedReason = res.value; this.cdr.detectChanges(); } });
      this.orderService.getSetting('foodybhai_upi').subscribe(res => { if (res && res.value) { this.upiId = res.value; this.cdr.detectChanges(); } });
      
      
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
    this.isAddingAddress = true;
    this.authService.addAddress({ label: this.newAddressLabel, fullAddress: this.newAddressText }).subscribe({
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
    if (!this.authService.isLoggedIn()) {
      this.uiService.openAuthModal();
      return;
    }
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
    this.codConfirmed = false;
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
  }

  confirmPaymentAndPlaceOrder() {
    if (this.paymentMethod === 'cod' && !this.codConfirmed) {
      this.showToast('Please confirm you will pay cash on delivery.', 'error');
      return;
    }

    let finalAddress = this.deliveryAddress;
    if (this.orderType === 'delivery') {
      const selected = this.savedAddresses.find(a => a.id === this.selectedAddressId);
      if (selected) finalAddress = selected.fullAddress;
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
        address: finalAddress
      }
    }).subscribe({
      next: () => {
        this.isPlacingOrder = false;
        this.showPaymentModal = false;
        this.cartService.clearCart();
        this.deliveryAddress = '';
        this.showToast('🎉 Order placed successfully! We\'ll start preparing your food.', 'success');
        setTimeout(() => this.router.navigate(['/orders']), 2000);
      },
      error: (err) => {
        this.isPlacingOrder = false;
        console.error(err);
        this.showToast('Failed to place order. Please try again.', 'error');
      }
    });
  }
}

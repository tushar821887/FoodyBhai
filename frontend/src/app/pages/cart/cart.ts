import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService, Address } from '../../services/auth.service';
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
  
  // Address properties
  deliveryAddress = ''; // Fallback for guest users
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
  private currentTotal = 0;

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    public authService: AuthService,
    private router: Router
  ) {
    // Optionally fetch full profile if we only have partial user stored
    if (this.authService.isLoggedIn()) {
      this.authService.fetchProfile().subscribe();
    }

    this.authSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.customerName = user.name;
        this.customerPhone = user.email; // Fallback
        this.savedAddresses = user.addresses || [];
        
        // Auto-select first address if none selected
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
  }

  ngOnDestroy() {
    if (this.authSub) this.authSub.unsubscribe();
  }

  // --- Coupon Logic ---
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
      this.couponSuccess = 'Coupon applied successfully! 20% OFF';
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

  // --- Stepper Logic ---
  currentStep = 1;

  setStep(step: number) {
    // Basic validation before allowing moving forward
    if (step === 2 && this.cartService.getCurrentTotal() < 100) {
      alert("Minimum order of ₹100 required.");
      return;
    }
    if (step === 3) {
      if (!this.customerName || !this.customerPhone) {
        alert("Please fill in your Name and Phone Number.");
        return;
      }
      if (this.authService.isLoggedIn() && !this.selectedAddressId && this.savedAddresses.length > 0) {
        alert("Please select a delivery address.");
        return;
      }
      if (!this.authService.isLoggedIn() && !this.deliveryAddress) {
        alert("Please provide a delivery address.");
        return;
      }
    }
    
    // Only allow going to previous steps or next step if validated
    if (step < this.currentStep || step === this.currentStep + 1) {
      this.currentStep = step;
    }
  }

  nextStep() {
    this.setStep(this.currentStep + 1);
  }

  prevStep() {
    this.setStep(this.currentStep - 1);
  }

  // --- Address Logic ---
  get selectedAddress() {
    return this.savedAddresses.find(a => a.id === this.selectedAddressId) || null;
  }

  selectAddress(id: string | undefined) {
    if (id) {
      this.selectedAddressId = id;
    }
  }

  toggleNewAddressForm() {
    this.showNewAddressForm = !this.showNewAddressForm;
  }

  saveNewAddress() {
    if (!this.newAddressLabel || !this.newAddressText) return;
    
    this.isAddingAddress = true;
    this.authService.addAddress({
      label: this.newAddressLabel,
      fullAddress: this.newAddressText
    }).subscribe({
      next: (user) => {
        this.isAddingAddress = false;
        this.showNewAddressForm = false;
        this.newAddressText = '';
        if (user.addresses && user.addresses.length > 0) {
          const added = user.addresses[user.addresses.length - 1];
          this.selectedAddressId = added.id || null;
        }
      },
      error: () => {
        this.isAddingAddress = false;
        alert('Failed to save address. Please try again.');
      }
    });
  }

  deleteAddress(id: string | undefined, event: Event) {
    event.stopPropagation();
    if (!id || !confirm('Delete this address?')) return;
    this.authService.deleteAddress(id).subscribe();
  }

  // --- Checkout ---
  checkout() {
    let finalAddress = this.deliveryAddress;

    if (this.authService.isLoggedIn()) {
      if (this.savedAddresses.length > 0) {
        if (!this.selectedAddressId) {
          alert("Please select a delivery address.");
          return;
        }
        const selected = this.savedAddresses.find(a => a.id === this.selectedAddressId);
        if (selected) {
          finalAddress = selected.fullAddress;
        }
      } else {
        alert("Please add a delivery address.");
        return;
      }
    }

    if (!this.customerName || !this.customerPhone || !finalAddress) {
      alert("Please fill in your Name, Phone Number, and Delivery Address.");
      return;
    }
    
    const link = this.cartService.getWhatsAppLinkWithDetails(
      this.customerName, 
      this.customerPhone, 
      finalAddress
    );

    const finishCheckout = () => {
      if (link) window.open(link, '_blank');
      this.cartService.clearCart();
      this.deliveryAddress = '';
      this.router.navigate(['/orders']); // Redirect to orders page
    };

    if (this.authService.isLoggedIn()) {
      let items: CartItem[] = [];
      this.cartService.items$.subscribe(i => items = i).unsubscribe();
      
      this.orderService.placeOrder({
        items,
        totalAmount: this.currentTotal,
        deliveryDetails: {
          name: this.customerName,
          phone: this.customerPhone,
          address: finalAddress
        }
      }).subscribe({
        next: () => finishCheckout(),
        error: (err) => {
          console.error(err);
          alert("Failed to save order to history, but we will redirect you to WhatsApp to complete it.");
          finishCheckout();
        }
      });
    } else {
      finishCheckout();
    }
  }
}

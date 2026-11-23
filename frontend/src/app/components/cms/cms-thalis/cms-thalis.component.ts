import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CmsSection } from '../../../models/cms.model';
import { TiffinService, TiffinPlan } from '../../../services/tiffin.service';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { Recipe } from '../../../services/recipe.service';

export interface PlanAddonOption {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  quantity: number;
}

@Component({
  selector: 'app-cms-thalis',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <section class="cms-thalis-section"
             [class.is-light-text]="section.style?.textColor === '#ffffff'"
             [style.padding-top]="section.style?.paddingTop || '70px'"
             [style.padding-bottom]="section.style?.paddingBottom || '70px'"
             [style.background-color]="section.style?.backgroundColor || '#faf7f2'"
             [style.background]="section.style?.backgroundGradient || section.style?.backgroundColor || '#faf7f2'"
             [style.color]="section.style?.textColor || 'inherit'">
      <div class="container" [style.max-width]="section.style?.maxWidth || '1200px'">

        <!-- FLOATING CART TOAST -->
        <div *ngIf="cartToastMessage" class="cart-toast-banner animate-slide-down">
          <div class="toast-content">
            <span class="toast-icon">✅</span>
            <span class="toast-text">{{ cartToastMessage }}</span>
          </div>
          <button type="button" class="btn-toast-view-cart" (click)="goToCart()">
            View Cart ({{ cartService.totalItems$ | async }}) →
          </button>
        </div>

        <!-- SECTION HEADER (CENTERED & VERTICALLY STACKED) -->
        <div class="section-header text-center animate-fade-in">
          <div class="header-top-row">
            <div *ngIf="section.badge || 'Instant Order & Subscriptions'" class="section-tag">
              {{ section.badge || 'Instant Order & Subscriptions' }}
            </div>
            <button type="button" class="btn-manage-subs" (click)="openMySubscriptionsModal()">
              <span class="sub-icon">📦</span>
              <span>My Subscriptions</span>
              <span class="sub-badge" *ngIf="userSubscriptions.length > 0">{{ userSubscriptions.length }}</span>
            </button>
          </div>

          <h2 class="section-title"
              [style.color]="section.style?.textColor || '#1e293b'"
              [style.font-size]="section.style?.titleFontSize || '36px'"
              [innerHTML]="section.title || 'Our Handcrafted Thalis & Meal Plans'">
          </h2>

          <p class="section-desc"
             [style.color]="section.style?.textColor ? (section.style?.textColor === '#ffffff' ? 'rgba(255,255,255,0.85)' : section.style?.textColor) : '#64748b'"
             [style.font-size]="section.style?.contentFontSize || '16px'"
             [innerHTML]="section.subtitle || 'Select trial meal to test taste or subscribe for 7 or 30 days. Pause or cancel anytime with single click.'">
          </p>

          <!-- DURATION TOGGLE BUTTONS -->
          <div class="duration-toggle-wrapper">
            <button type="button"
                    class="duration-tab"
                    [class.active]="selectedDuration === 'trial'"
                    (click)="selectedDuration = 'trial'">
              <span class="tab-label">1-Time / Trial</span>
              <span class="tab-sub">Single meal order</span>
            </button>
            
            <button type="button"
                    class="duration-tab active-glow"
                    [class.active]="selectedDuration === 'weekly'"
                    (click)="selectedDuration = 'weekly'">
              <span class="tab-badge">POPULAR</span>
              <span class="tab-label">Weekly Plan (7 Days)</span>
              <span class="tab-sub">Most flexible choice</span>
            </button>

            <button type="button"
                    class="duration-tab"
                    [class.active]="selectedDuration === 'monthly'"
                    (click)="selectedDuration = 'monthly'">
              <span class="tab-badge save-badge">SAVE 25%</span>
              <span class="tab-label">Monthly Plan (30 Days)</span>
              <span class="tab-sub">Best everyday value</span>
            </button>
          </div>
        </div>

        <!-- SKELETONS WHILE LOADING -->
        <div *ngIf="isLoading" class="plans-grid">
          <div *ngFor="let s of [1,2,3]" class="plan-card skeleton-card">
            <div class="skeleton-img"></div>
            <div class="skeleton-body">
              <div class="skeleton-line title"></div>
              <div class="skeleton-line subtitle"></div>
              <div class="skeleton-box price"></div>
              <div class="skeleton-line text"></div>
              <div class="skeleton-line text"></div>
            </div>
          </div>
        </div>

        <!-- PLANS CARDS GRID -->
        <div *ngIf="!isLoading && plans.length > 0" class="plans-grid">
          <div *ngFor="let plan of plans; trackBy: trackBySlug" 
               class="plan-card" 
               [class.featured]="plan.isPopular"
               [class.best-value]="plan.isBestValue">

            <!-- Card Ribbon Badges -->
            <div class="card-badge" *ngIf="plan.isPopular">👑 MOST POPULAR</div>
            <div class="card-badge value-badge" *ngIf="plan.isBestValue && !plan.isPopular">🌟 BEST VALUE</div>

            <!-- Card Image Box -->
            <div class="card-image-box">
              <img [src]="plan.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'" 
                   [alt]="plan.name" 
                   loading="lazy">
              <div class="card-tags-overlay">
                <span class="dietary-badge" [class]="plan.dietaryType">
                  <span class="diet-dot"></span>
                  {{ plan.dietaryType === 'veg' ? 'Pure Veg' : (plan.dietaryType === 'jain' ? 'Jain' : 'Non-Veg') }}
                </span>
                <span class="rating-badge" *ngIf="plan.rating">
                  ★ {{ plan.rating }} ({{ plan.reviewsCount || 50 }}+)
                </span>
              </div>
            </div>

            <!-- Card Body -->
            <div class="card-body">
              <h3 class="plan-title">{{ plan.name }}</h3>
              <p class="plan-tagline">{{ plan.tagline }}</p>

              <!-- Dynamic Price Box -->
              <div class="price-box">
                <div class="main-price">
                  <span class="currency">₹</span>
                  <span class="amount">{{ getPriceForDuration(plan) }}</span>
                  <span class="unit">
                    {{ selectedDuration === 'trial' ? '/ single trial meal' : (selectedDuration === 'weekly' ? '/ 7 days (1 meal/day)' : '/ 30 days') }}
                  </span>
                </div>
                <div class="effective-price">
                  Effective only <strong>₹{{ plan.perMealPrice }}/meal</strong> • Free Delivery
                </div>
              </div>

              <!-- What's In The Dabba -->
              <div class="dabba-contents">
                <div class="contents-header">
                  <span class="header-icon">🍱</span>
                  <span>WHAT'S IN THE DABBA:</span>
                </div>
                <ul class="items-list">
                  <li *ngFor="let item of (plan.items || []).slice(0, 5)">
                    <span class="check-icon">✓</span>
                    <span>{{ item }}</span>
                  </li>
                  <li *ngIf="(plan.items || []).length > 5" class="more-items">
                    + {{ plan.items.length - 5 }} more items included
                  </li>
                </ul>
              </div>

              <!-- USPs / Key Features -->
              <div class="plan-features" *ngIf="plan.features?.length">
                <div class="feature-tag" *ngFor="let feature of plan.features.slice(0, 3)">
                  <span class="feat-dot">•</span> {{ feature }}
                </div>
              </div>

              <!-- Card Action Buttons -->
              <div class="card-actions">
                <button type="button" 
                        class="btn btn-cart-quick" 
                        (click)="openCustomizeModal(plan, $event)">
                  <span class="btn-icon">🛒</span>
                  <span>Add to Cart</span>
                </button>

                <button type="button" 
                        class="btn btn-subscribe" 
                        (click)="openSubscribeModal(plan, $event)">
                  <span>{{ selectedDuration === 'trial' ? 'Order Trial' : 'Subscribe' }}</span>
                  <span class="arrow-icon">→</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- BOTTOM LINK / CTA -->
        <div class="text-center" style="margin-top: 3rem;">
          <a [routerLink]="section.buttonLink || '/tiffin'" class="btn btn-primary btn-lg-view-all">
            {{ section.buttonText || 'Explore All Tiffin Plans & Weekly Menu' }} →
          </a>
        </div>

      </div>
    </section>

    <!-- ==================== CUSTOMIZE & ADD-TO-CART MODAL ==================== -->
    <div class="modal-backdrop-custom animate-fade-in" *ngIf="activeCustomizingPlan" (click)="closeCustomizeModal()">
      <div class="modal-dialog-custom animate-scale-up" (click)="$event.stopPropagation()">
        
        <div class="modal-header-custom">
          <div>
            <span class="modal-badge">🍱 THALI CUSTOMIZATION</span>
            <h3 class="modal-title">Add {{ activeCustomizingPlan.name }} to Cart</h3>
            <p class="modal-sub">Add extra phulkas, raita, sweet dish or side portions before ordering.</p>
          </div>
          <button type="button" class="btn-close-modal" (click)="closeCustomizeModal()">✕</button>
        </div>

        <div class="modal-body-custom">
          <!-- Base Thali Details -->
          <div class="base-thali-summary">
            <img [src]="activeCustomizingPlan.image" [alt]="activeCustomizingPlan.name" class="summary-thali-img">
            <div class="summary-thali-info">
              <h4>{{ activeCustomizingPlan.name }} (Single Meal)</h4>
              <p class="summary-desc">{{ activeCustomizingPlan.tagline }}</p>
              <div class="summary-price">Base Price: <strong>₹{{ activeCustomizingPlan.trialPrice }}</strong></div>
            </div>
          </div>

          <!-- Addons List -->
          <div class="addons-section">
            <h4 class="addons-title">
              <span>🍛 Add Extra Items / Sides</span>
              <span class="addons-subtitle">Optional Extras</span>
            </h4>

            <div class="addons-grid">
              <div *ngFor="let addon of availableAddons" class="addon-card" [class.selected]="addon.quantity > 0">
                <div class="addon-info">
                  <div class="addon-name">{{ addon.name }}</div>
                  <div class="addon-meta">
                    <span class="addon-cat">{{ addon.category }}</span> • 
                    <span class="addon-price">+₹{{ addon.price }}</span>
                  </div>
                </div>

                <div class="addon-counter">
                  <button type="button" class="btn-qty" (click)="decrementAddon(addon)" [disabled]="addon.quantity === 0">-</button>
                  <span class="qty-num">{{ addon.quantity }}</span>
                  <button type="button" class="btn-qty" (click)="incrementAddon(addon)">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer-custom">
          <div class="total-summary-box">
            <span class="lbl">TOTAL PAYABLE:</span>
            <span class="val">₹{{ getCustomizedTotalPrice() }}</span>
          </div>

          <div class="modal-btn-group">
            <button type="button" class="btn btn-secondary-custom" (click)="closeCustomizeModal()">Cancel</button>
            <button type="button" class="btn btn-primary-custom" (click)="confirmAddToCartWithCustomization()">
              Add to Cart (₹{{ getCustomizedTotalPrice() }}) →
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ==================== SUBSCRIBE CHECKOUT MODAL ==================== -->
    <div class="modal-backdrop-custom animate-fade-in" *ngIf="isSubscribeModalOpen" (click)="closeSubscribeModal()">
      <div class="modal-dialog-custom modal-dialog-wide animate-scale-up" (click)="$event.stopPropagation()">
        
        <div class="modal-header-custom">
          <div>
            <span class="modal-badge">🚀 FAST SUBSCRIPTION</span>
            <h3 class="modal-title">Subscribe to {{ activeSubscribePlan?.name }}</h3>
            <p class="modal-sub">Daily fresh, hot homestyle meals delivered directly to your doorstep in Meerut.</p>
          </div>
          <button type="button" class="btn-close-modal" (click)="closeSubscribeModal()">✕</button>
        </div>

        <div class="modal-body-custom" *ngIf="activeSubscribePlan">

          <!-- 1. Duration Selection -->
          <div class="form-section-block">
            <label class="block-label">1. Choose Subscription Duration</label>
            <div class="sub-duration-grid">
              <label class="sub-duration-card" [class.selected]="subscribeDuration === 'trial'">
                <input type="radio" name="subDuration" value="trial" [(ngModel)]="subscribeDuration">
                <div class="dur-content">
                  <span class="dur-title">1-Day Trial</span>
                  <span class="dur-price">₹{{ activeSubscribePlan.trialPrice }}</span>
                  <span class="dur-sub">Single taste test</span>
                </div>
              </label>

              <label class="sub-duration-card" [class.selected]="subscribeDuration === 'weekly'">
                <input type="radio" name="subDuration" value="weekly" [(ngModel)]="subscribeDuration">
                <div class="dur-badge">POPULAR</div>
                <div class="dur-content">
                  <span class="dur-title">Weekly (7 Days)</span>
                  <span class="dur-price">₹{{ activeSubscribePlan.weeklyPrice }}</span>
                  <span class="dur-sub">Most flexible</span>
                </div>
              </label>

              <label class="sub-duration-card" [class.selected]="subscribeDuration === 'monthly'">
                <input type="radio" name="subDuration" value="monthly" [(ngModel)]="subscribeDuration">
                <div class="dur-badge save">SAVE 25%</div>
                <div class="dur-content">
                  <span class="dur-title">Monthly (30 Days)</span>
                  <span class="dur-price">₹{{ activeSubscribePlan.monthlyPrice }}</span>
                  <span class="dur-sub">Best value</span>
                </div>
              </label>
            </div>
          </div>

          <!-- 2. Meal Slot -->
          <div class="form-section-block">
            <label class="block-label">2. Select Meal Slot</label>
            <div class="sub-slot-grid">
              <label class="sub-slot-card" [class.selected]="subscribeMealSlot === 'lunch'">
                <input type="radio" name="subMealSlot" value="lunch" [(ngModel)]="subscribeMealSlot">
                <div class="slot-icon">☀️</div>
                <div class="slot-text">
                  <strong>Lunch Only</strong>
                  <span>12:30 PM - 02:00 PM</span>
                </div>
              </label>

              <label class="sub-slot-card" [class.selected]="subscribeMealSlot === 'dinner'">
                <input type="radio" name="subMealSlot" value="dinner" [(ngModel)]="subscribeMealSlot">
                <div class="slot-icon">🌙</div>
                <div class="slot-text">
                  <strong>Dinner Only</strong>
                  <span>07:30 PM - 09:30 PM</span>
                </div>
              </label>

              <label class="sub-slot-card" [class.selected]="subscribeMealSlot === 'both'">
                <input type="radio" name="subMealSlot" value="both" [(ngModel)]="subscribeMealSlot">
                <div class="slot-icon">🍱</div>
                <div class="slot-text">
                  <strong>Both Lunch & Dinner</strong>
                  <span>2 Meals Daily (10% Off)</span>
                </div>
              </label>
            </div>
          </div>

          <!-- 3. Delivery Details -->
          <div class="form-section-block">
            <label class="block-label">3. Meerut Delivery Details</label>
            
            <div class="form-row-2">
              <div class="form-field">
                <label>Customer Name *</label>
                <input type="text" [(ngModel)]="subCustomerName" placeholder="e.g. Rahul Sharma" class="modal-input">
                <span class="err-text" *ngIf="subFormErrors['name']">{{ subFormErrors['name'] }}</span>
              </div>

              <div class="form-field">
                <label>WhatsApp Mobile No. *</label>
                <input type="tel" [(ngModel)]="subCustomerPhone" placeholder="10-digit mobile number" class="modal-input">
                <span class="err-text" *ngIf="subFormErrors['phone']">{{ subFormErrors['phone'] }}</span>
              </div>
            </div>

            <div class="form-field">
              <label>House / Flat No., Street, Building *</label>
              <input type="text" [(ngModel)]="subStreet" placeholder="e.g. Flat 302, Green Valley Apartments" class="modal-input">
              <span class="err-text" *ngIf="subFormErrors['street']">{{ subFormErrors['street'] }}</span>
            </div>

            <div class="form-row-2">
              <div class="form-field">
                <label>Area in Meerut *</label>
                <select [(ngModel)]="subArea" class="modal-input modal-select">
                  <option value="" disabled>Select your delivery area</option>
                  <option *ngFor="let a of areasInMeerut" [value]="a">{{ a }}</option>
                </select>
                <span class="err-text" *ngIf="subFormErrors['area']">{{ subFormErrors['area'] }}</span>
              </div>

              <div class="form-field">
                <label>Nearest Landmark (Optional)</label>
                <input type="text" [(ngModel)]="subLandmark" placeholder="e.g. Near Shiv Mandir" class="modal-input">
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-field">
                <label>Starting Date *</label>
                <input type="date" [(ngModel)]="subStartDate" class="modal-input">
                <span class="err-text" *ngIf="subFormErrors['startDate']">{{ subFormErrors['startDate'] }}</span>
              </div>

              <div class="form-field">
                <label>Special Instructions / Diet Note</label>
                <input type="text" [(ngModel)]="subSpecialInstructions" placeholder="e.g. No onion-garlic, less spicy" class="modal-input">
              </div>
            </div>
          </div>

          <!-- 4. Payment Method -->
          <div class="form-section-block">
            <label class="block-label">4. Payment Method</label>
            <div class="payment-method-row">
              <label class="pay-method-card" [class.selected]="subPaymentMethod === 'cod'">
                <input type="radio" name="subPayMethod" value="cod" [(ngModel)]="subPaymentMethod">
                <span class="pay-icon">💵</span>
                <span class="pay-label">Cash on Delivery (Pay on 1st Meal)</span>
              </label>

              <label class="pay-method-card" [class.selected]="subPaymentMethod === 'upi'">
                <input type="radio" name="subPayMethod" value="upi" [(ngModel)]="subPaymentMethod">
                <span class="pay-icon">📱</span>
                <span class="pay-label">UPI / QR Code on Delivery</span>
              </label>
            </div>
          </div>

          <!-- Live Breakdown -->
          <div class="sub-pricing-summary">
            <div class="summary-line">
              <span>Selected Plan:</span>
              <strong>{{ activeSubscribePlan.name }}</strong>
            </div>
            <div class="summary-line">
              <span>Total Meals:</span>
              <span>{{ getCalculatedSubscribeMealsCount() }} Meals ({{ subscribeDuration === 'trial' ? '1 Day' : (subscribeDuration === 'weekly' ? '7 Days' : '30 Days') }})</span>
            </div>
            <div class="summary-line text-green">
              <span>Doorstep Delivery:</span>
              <strong>FREE</strong>
            </div>
            <div class="summary-line line-total">
              <span>Total Payable Amount:</span>
              <span class="total-highlight">₹{{ getSubscribePrice() }}</span>
            </div>
          </div>

        </div>

        <div class="modal-footer-custom">
          <button type="button" class="btn btn-secondary-custom" (click)="closeSubscribeModal()">Cancel</button>
          <button type="button" class="btn btn-primary-custom" [disabled]="isSubmittingSubscribe" (click)="submitSubscription()">
            <span *ngIf="!isSubmittingSubscribe">Confirm Subscription • ₹{{ getSubscribePrice() }} →</span>
            <span *ngIf="isSubmittingSubscribe">Booking Subscription...</span>
          </button>
        </div>

      </div>
    </div>

    <!-- ==================== SUBSCRIPTION SUCCESS MODAL ==================== -->
    <div class="modal-backdrop-custom animate-fade-in" *ngIf="isSubscribeSuccessModalOpen" (click)="closeSubscribeSuccessModal()">
      <div class="modal-dialog-custom animate-scale-up text-center" (click)="$event.stopPropagation()">
        
        <div class="modal-body-custom" style="padding: 2rem 1.5rem; text-align: center;">
          <div class="success-icon-badge">🎉</div>
          <h3 class="success-modal-title">Subscription Confirmed!</h3>
          <p class="success-modal-desc">
            Your daily tiffin subscription is booked. Fresh, delicious homestyle food is on its way!
          </p>

          <div class="success-order-card" *ngIf="confirmedSubscription">
            <div class="succ-row">
              <span class="lbl">Subscription ID:</span>
              <span class="val badge-order-id">{{ confirmedSubscription.orderId }}</span>
            </div>
            <div class="succ-row">
              <span class="lbl">Plan:</span>
              <span class="val"><strong>{{ confirmedSubscription.planName }}</strong></span>
            </div>
            <div class="succ-row">
              <span class="lbl">Slot:</span>
              <span class="val">{{ confirmedSubscription.mealSlot | uppercase }}</span>
            </div>
            <div class="succ-row">
              <span class="lbl">Starts On:</span>
              <span class="val">{{ confirmedSubscription.startDate }}</span>
            </div>
            <div class="succ-row">
              <span class="lbl">Total Amount:</span>
              <span class="val text-orange font-bold">₹{{ confirmedSubscription.totalAmount }} ({{ confirmedSubscription.paymentMethod | uppercase }})</span>
            </div>
          </div>

          <div class="kitchen-support-info">
            <span class="support-icon">📞</span>
            <span>Kitchen WhatsApp & Support: <strong>+91 8218870579</strong></span>
          </div>

          <div class="modal-success-btn-group">
            <button type="button" class="btn btn-primary-custom" (click)="closeSubscribeSuccessModal(); openMySubscriptionsModal()">
              View & Manage My Subscriptions 📦
            </button>
            <button type="button" class="btn btn-secondary-custom" (click)="closeSubscribeSuccessModal()">
              Done
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ==================== MY SUBSCRIPTIONS MODAL ==================== -->
    <div class="modal-backdrop-custom animate-fade-in" *ngIf="isMySubsModalOpen" (click)="closeMySubscriptionsModal()">
      <div class="modal-dialog-custom modal-dialog-wide animate-scale-up" (click)="$event.stopPropagation()">
        
        <div class="modal-header-custom">
          <div>
            <span class="modal-badge">📦 CUSTOMER DASHBOARD</span>
            <h3 class="modal-title">My Tiffin Subscriptions</h3>
            <p class="modal-sub">View active plans, pause/resume deliveries, change slots, or cancel anytime.</p>
          </div>
          <button type="button" class="btn-close-modal" (click)="closeMySubscriptionsModal()">✕</button>
        </div>

        <div class="modal-body-custom">
          
          <!-- Phone lookup bar -->
          <div class="subs-lookup-bar">
            <div class="lookup-input-box">
              <span class="lookup-icon">📱</span>
              <input type="tel" 
                     [(ngModel)]="subsLookupPhone" 
                     placeholder="Enter 10-digit mobile number" 
                     class="lookup-input"
                     (keyup.enter)="loadUserSubscriptions(true)">
            </div>
            <button type="button" class="btn btn-primary-custom btn-lookup" (click)="loadUserSubscriptions(true)">
              Find Subscriptions
            </button>
          </div>

          <!-- Loading Spinner -->
          <div *ngIf="isLoadingMySubs" class="subs-loading-state">
            <span class="spinner-icon">⏳</span>
            <span>Fetching your subscriptions...</span>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoadingMySubs && userSubscriptions.length === 0" class="subs-empty-state">
            <div class="empty-icon-lg">🍱</div>
            <h4>No Active Subscriptions Found</h4>
            <p *ngIf="subsLookupPhone">We could not find any subscriptions registered with mobile number <strong>{{ subsLookupPhone }}</strong>.</p>
            <p *ngIf="!subsLookupPhone">Enter your registered mobile number above to view your subscriptions.</p>
            <button type="button" class="btn btn-primary-custom" style="margin-top: 10px;" (click)="closeMySubscriptionsModal()">
              Explore Thalis & Subscribe Now →
            </button>
          </div>

          <!-- Subscriptions List -->
          <div *ngIf="!isLoadingMySubs && userSubscriptions.length > 0" class="subs-list">
            <div *ngFor="let sub of userSubscriptions" class="sub-item-card" [class.sub-paused]="sub.status === 'paused'" [class.sub-cancelled]="sub.status === 'cancelled'">
              
              <!-- Sub Card Header -->
              <div class="sub-card-top">
                <div class="sub-id-wrap">
                  <span class="order-id-badge">{{ sub.orderId }}</span>
                  <span class="sub-created-date">{{ sub.createdAt | date:'mediumDate' }}</span>
                </div>
                
                <div class="sub-status-pill" [ngClass]="'status-' + sub.status">
                  <span class="status-dot"></span>
                  <span class="status-lbl">{{ sub.status === 'active' ? 'Active Delivery' : (sub.status === 'paused' ? 'Paused (On Hold)' : (sub.status === 'cancelled' ? 'Cancelled' : 'Completed')) }}</span>
                </div>
              </div>

              <!-- Sub Card Details Grid -->
              <div class="sub-details-grid">
                <div class="detail-cell">
                  <span class="c-lbl">Thali Plan</span>
                  <strong class="c-val text-dark">{{ sub.planName }}</strong>
                </div>

                <div class="detail-cell">
                  <span class="c-lbl">Duration</span>
                  <span class="badge badge-duration">{{ sub.subscriptionType | uppercase }}</span>
                </div>

                <div class="detail-cell">
                  <span class="c-lbl">Delivery Slot</span>
                  <strong class="c-val">
                    <span *ngIf="sub.mealSlot === 'lunch'">☀️ Lunch Only</span>
                    <span *ngIf="sub.mealSlot === 'dinner'">🌙 Dinner Only</span>
                    <span *ngIf="sub.mealSlot === 'both'">🍱 Both Lunch & Dinner</span>
                    <span *ngIf="sub.mealSlot !== 'lunch' && sub.mealSlot !== 'dinner' && sub.mealSlot !== 'both'">{{ sub.mealSlot | titlecase }}</span>
                  </strong>
                </div>

                <div class="detail-cell">
                  <span class="c-lbl">Amount</span>
                  <strong class="c-val text-orange">₹{{ sub.totalAmount }} ({{ sub.paymentMethod | uppercase }})</strong>
                </div>

                <div class="detail-cell col-span-2">
                  <span class="c-lbl">Delivery Address</span>
                  <div class="c-val address-text">
                    📍 {{ sub.deliveryAddress?.street }}, {{ sub.deliveryAddress?.area }}, {{ sub.deliveryAddress?.city }}
                    <span *ngIf="sub.deliveryAddress?.landmark"> (Landmark: {{ sub.deliveryAddress?.landmark }})</span>
                  </div>
                </div>

                <div class="detail-cell" *ngIf="sub.startDate">
                  <span class="c-lbl">Starts On</span>
                  <span class="c-val">{{ sub.startDate }}</span>
                </div>

                <div class="detail-cell" *ngIf="sub.specialInstructions">
                  <span class="c-lbl">Dietary Note</span>
                  <span class="c-val text-italic">"{{ sub.specialInstructions }}"</span>
                </div>
              </div>

              <!-- Sub Actions Bar -->
              <div class="sub-actions-bar">
                <!-- If Active: Show Pause & Change & Cancel -->
                <ng-container *ngIf="sub.status === 'active'">
                  <button type="button" class="btn-sub-act btn-pause" (click)="togglePauseSubscription(sub)">
                    ⏸️ Pause Deliveries
                  </button>
                  <button type="button" class="btn-sub-act btn-edit" (click)="openEditSubModal(sub)">
                    ✏️ Change Slot / Address
                  </button>
                  <button type="button" class="btn-sub-act btn-cancel" (click)="cancelSubscription(sub)">
                    ❌ Unsubscribe
                  </button>
                </ng-container>

                <!-- If Paused: Show Resume & Change & Cancel -->
                <ng-container *ngIf="sub.status === 'paused'">
                  <button type="button" class="btn-sub-act btn-resume" (click)="togglePauseSubscription(sub)">
                    ▶️ Resume Deliveries
                  </button>
                  <button type="button" class="btn-sub-act btn-edit" (click)="openEditSubModal(sub)">
                    ✏️ Change Slot / Address
                  </button>
                  <button type="button" class="btn-sub-act btn-cancel" (click)="cancelSubscription(sub)">
                    ❌ Unsubscribe
                  </button>
                </ng-container>

                <!-- If Cancelled / Completed: Show Re-subscribe -->
                <ng-container *ngIf="sub.status === 'cancelled' || sub.status === 'completed'">
                  <button type="button" class="btn-sub-act btn-resub" (click)="resubscribePlan(sub)">
                    🔄 Re-subscribe
                  </button>
                </ng-container>
              </div>

            </div>
          </div>

        </div>

        <div class="modal-footer-custom">
          <button type="button" class="btn btn-secondary-custom" (click)="closeMySubscriptionsModal()">Close</button>
        </div>

      </div>
    </div>

    <!-- ==================== EDIT SUBSCRIPTION MODAL ==================== -->
    <div class="modal-backdrop-custom animate-fade-in" *ngIf="isEditSubModalOpen" (click)="closeEditSubModal()">
      <div class="modal-dialog-custom animate-scale-up" (click)="$event.stopPropagation()">
        
        <div class="modal-header-custom">
          <div>
            <span class="modal-badge">✏️ EDIT SUBSCRIPTION</span>
            <h3 class="modal-title">Change Subscription #{{ editingSub?.orderId }}</h3>
            <p class="modal-sub">Update your delivery meal slot, address, or special notes.</p>
          </div>
          <button type="button" class="btn-close-modal" (click)="closeEditSubModal()">✕</button>
        </div>

        <div class="modal-body-custom" *ngIf="editingSub">
          
          <!-- Slot selection -->
          <div class="form-section-block">
            <label class="block-label">Meal Slot</label>
            <div class="sub-slot-grid">
              <label class="sub-slot-card" [class.selected]="editMealSlot === 'lunch'">
                <input type="radio" name="editSlot" value="lunch" [(ngModel)]="editMealSlot">
                <div class="slot-text">
                  <strong>☀️ Lunch Only</strong>
                  <span>12:30 PM - 02:00 PM</span>
                </div>
              </label>

              <label class="sub-slot-card" [class.selected]="editMealSlot === 'dinner'">
                <input type="radio" name="editSlot" value="dinner" [(ngModel)]="editMealSlot">
                <div class="slot-text">
                  <strong>🌙 Dinner Only</strong>
                  <span>07:30 PM - 09:30 PM</span>
                </div>
              </label>

              <label class="sub-slot-card" [class.selected]="editMealSlot === 'both'">
                <input type="radio" name="editSlot" value="both" [(ngModel)]="editMealSlot">
                <div class="slot-text">
                  <strong>🍱 Both Lunch & Dinner</strong>
                  <span>2 Meals Daily</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Address -->
          <div class="form-section-block">
            <label class="block-label">Delivery Address in Meerut</label>
            <div class="form-field">
              <label>Street / Flat / House Address *</label>
              <input type="text" [(ngModel)]="editStreet" class="modal-input">
            </div>

            <div class="form-row-2">
              <div class="form-field">
                <label>Area in Meerut *</label>
                <select [(ngModel)]="editArea" class="modal-input modal-select">
                  <option value="" disabled>Select your delivery area</option>
                  <option *ngFor="let a of areasInMeerut" [value]="a">{{ a }}</option>
                </select>
              </div>

              <div class="form-field">
                <label>Landmark (Optional)</label>
                <input type="text" [(ngModel)]="editLandmark" class="modal-input">
              </div>
            </div>

            <div class="form-field">
              <label>Special Instructions / Diet Note</label>
              <input type="text" [(ngModel)]="editSpecialInstructions" placeholder="e.g. Less spicy, call on arrival" class="modal-input">
            </div>
          </div>

        </div>

        <div class="modal-footer-custom">
          <button type="button" class="btn btn-secondary-custom" (click)="closeEditSubModal()">Cancel</button>
          <button type="button" class="btn btn-primary-custom" [disabled]="isSavingEditSub" (click)="saveSubscriptionChanges()">
            <span *ngIf="!isSavingEditSub">Save Changes</span>
            <span *ngIf="isSavingEditSub">Saving Changes...</span>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .cms-thalis-section {
      width: 100%;
      position: relative;
    }
    .container {
      margin: 0 auto;
      padding: 0 1.25rem;
    }

    /* Floater toast */
    .cart-toast-banner {
      position: fixed;
      top: 90px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      background: #1e293b;
      color: white;
      padding: 12px 24px;
      border-radius: 50px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    }
    .btn-toast-view-cart {
      background: #ea580c;
      color: white;
      border: none;
      border-radius: 50px;
      padding: 6px 16px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
    }

    /* Section Header (Centered Flex Column) */
    .section-header {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      text-align: center !important;
      margin-bottom: 2.5rem;
    }
    .section-tag {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #ea580c;
      background: #ffedd5;
      padding: 0.35rem 0.85rem;
      border-radius: 50px;
      margin-bottom: 0.75rem;
    }
    .section-title {
      display: block !important;
      width: 100%;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 0.75rem;
      letter-spacing: -0.5px;
      text-align: center;
    }
    :host ::ng-deep .section-title span {
      color: #ea580c !important;
    }
    .section-desc {
      display: block;
      font-size: 1rem;
      color: #64748b;
      max-width: 650px;
      margin: 0 auto 1.5rem;
      line-height: 1.6;
      text-align: center;
    }

    /* Duration Switcher Tabs */
    .duration-toggle-wrapper {
      display: inline-flex;
      align-items: center;
      background: white;
      border: 1.5px solid #e2e8f0;
      border-radius: 50px;
      padding: 5px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.04);
      gap: 6px;
      margin-top: 0.5rem;
    }
    .duration-tab {
      position: relative;
      border: none;
      background: transparent;
      padding: 8px 22px;
      border-radius: 40px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: all 0.25s ease;
    }
    .duration-tab .tab-label {
      font-size: 0.92rem;
      font-weight: 700;
      color: #475569;
    }
    .duration-tab .tab-sub {
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 500;
    }
    .duration-tab.active {
      background: #ea580c;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.35);
    }
    .duration-tab.active .tab-label,
    .duration-tab.active .tab-sub {
      color: white;
    }
    .tab-badge {
      position: absolute;
      top: -10px;
      background: #10b981;
      color: white;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 20px;
      letter-spacing: 0.5px;
    }
    .save-badge {
      background: #8b5cf6;
    }

    /* Plans Cards Grid */
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      margin-top: 1.5rem;
    }
    @media (max-width: 992px) {
      .plans-grid {
        grid-template-columns: 1fr;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
      }
    }

    .plan-card {
      position: relative;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      border: 1.5px solid #f1f5f9;
      box-shadow: 0 8px 25px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
    }
    .plan-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 15px 35px rgba(234, 88, 12, 0.12);
      border-color: #fed7aa;
    }
    .plan-card.featured {
      border: 2px solid #ea580c;
    }
    .card-badge {
      position: absolute;
      top: 14px;
      right: 14px;
      z-index: 2;
      background: #ea580c;
      color: white;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 30px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    .card-badge.value-badge {
      background: #059669;
    }

    .card-image-box {
      position: relative;
      height: 200px;
      overflow: hidden;
    }
    .card-image-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .plan-card:hover .card-image-box img {
      transform: scale(1.05);
    }
    .card-tags-overlay {
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .dietary-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(4px);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      color: #166534;
    }
    .diet-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #16a34a;
    }
    .rating-badge {
      background: rgba(0,0,0,0.7);
      color: #fbbf24;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
    }

    .card-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .plan-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 0.35rem;
    }
    .plan-tagline {
      font-size: 0.88rem;
      color: #64748b;
      margin: 0 0 1.25rem;
      min-height: 38px;
    }

    .price-box {
      background: #fff8f5;
      border: 1px dashed #fed7aa;
      border-radius: 12px;
      padding: 0.85rem 1rem;
      margin-bottom: 1.25rem;
    }
    .main-price {
      display: flex;
      align-items: baseline;
      gap: 3px;
    }
    .main-price .currency {
      font-size: 1.2rem;
      font-weight: 800;
      color: #ea580c;
    }
    .main-price .amount {
      font-size: 2rem;
      font-weight: 800;
      color: #ea580c;
      line-height: 1;
    }
    .main-price .unit {
      font-size: 0.82rem;
      color: #64748b;
      font-weight: 600;
      margin-left: 4px;
    }
    .effective-price {
      font-size: 0.78rem;
      color: #475569;
      margin-top: 4px;
    }
    .effective-price strong {
      color: #1e293b;
    }

    .dabba-contents {
      margin-bottom: 1.25rem;
      flex: 1;
    }
    .contents-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #334155;
      margin-bottom: 0.6rem;
    }
    .items-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .items-list li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 0.86rem;
      color: #475569;
      margin-bottom: 0.35rem;
      line-height: 1.4;
    }
    .check-icon {
      color: #10b981;
      font-weight: 900;
    }
    .more-items {
      font-size: 0.8rem;
      color: #ea580c;
      font-weight: 700;
      margin-top: 4px;
    }

    .plan-features {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 1.5rem;
    }
    .feature-tag {
      font-size: 0.75rem;
      background: #f1f5f9;
      color: #475569;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 600;
    }

    .card-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: auto;
    }
    .btn-cart-quick {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: white;
      border: 1.5px solid #e2e8f0;
      color: #1e293b;
      font-weight: 700;
      font-size: 0.88rem;
      padding: 10px 14px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-cart-quick:hover {
      background: #ffedd5;
      border-color: #fdba74;
      color: #ea580c;
    }
    .btn-subscribe {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: #ea580c;
      color: white;
      border: none;
      font-weight: 700;
      font-size: 0.88rem;
      padding: 10px 14px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
    }
    .btn-subscribe:hover {
      background: #c2410c;
      transform: translateY(-1px);
    }

    .btn-lg-view-all {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 32px;
      background: #ea580c;
      color: white;
      font-weight: 700;
      font-size: 1rem;
      border-radius: 50px;
      text-decoration: none;
      box-shadow: 0 6px 20px rgba(234, 88, 12, 0.3);
      transition: all 0.25s;
    }
    .btn-lg-view-all:hover {
      background: #c2410c;
      transform: translateY(-2px);
    }

    /* Modal Styles */
    .modal-backdrop-custom {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-dialog-custom {
      background: white;
      border-radius: 20px;
      max-width: 580px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }
    .modal-header-custom {
      padding: 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .modal-badge {
      font-size: 0.72rem;
      font-weight: 800;
      color: #ea580c;
      background: #ffedd5;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .modal-title {
      font-size: 1.3rem;
      font-weight: 800;
      color: #1e293b;
      margin: 6px 0 2px;
    }
    .modal-sub {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0;
    }
    .btn-close-modal {
      background: #f1f5f9;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-weight: 700;
    }
    .modal-body-custom {
      padding: 1.5rem;
    }
    .base-thali-summary {
      display: flex;
      gap: 1rem;
      align-items: center;
      background: #f8fafc;
      padding: 12px;
      border-radius: 12px;
      margin-bottom: 1.25rem;
    }
    .summary-thali-img {
      width: 65px;
      height: 65px;
      border-radius: 10px;
      object-fit: cover;
    }
    .summary-thali-info h4 {
      margin: 0 0 2px;
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
    }
    .summary-desc {
      font-size: 0.8rem;
      color: #64748b;
      margin: 0 0 4px;
    }
    .summary-price {
      font-size: 0.85rem;
      color: #475569;
    }
    .summary-price strong {
      color: #ea580c;
    }
    .addons-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.85rem;
    }
    .addons-subtitle {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 600;
    }
    .addons-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .addon-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      transition: all 0.2s;
    }
    .addon-card.selected {
      border-color: #ea580c;
      background: #fff8f5;
    }
    .addon-name {
      font-size: 0.9rem;
      font-weight: 700;
      color: #1e293b;
    }
    .addon-meta {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 2px;
    }
    .addon-price {
      color: #ea580c;
      font-weight: 700;
    }
    .addon-counter {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn-qty {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: 1.5px solid #cbd5e1;
      background: white;
      cursor: pointer;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-qty:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .qty-num {
      font-size: 0.95rem;
      font-weight: 800;
      min-width: 18px;
      text-align: center;
    }
    .modal-footer-custom {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border-bottom-left-radius: 20px;
      border-bottom-right-radius: 20px;
    }
    .total-summary-box .lbl {
      display: block;
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748b;
    }
    .total-summary-box .val {
      font-size: 1.4rem;
      font-weight: 800;
      color: #ea580c;
    }
    .modal-btn-group {
      display: flex;
      gap: 10px;
    }
    .btn-secondary-custom {
      padding: 10px 18px;
      border: 1.5px solid #cbd5e1;
      background: white;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-primary-custom {
      padding: 10px 20px;
      background: #ea580c;
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
    }

    /* Subscriptions Header Bar */
    .header-top-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 0.5rem;
      width: 100%;
    }
    .btn-manage-subs {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: white;
      border: 1.5px solid #fdba74;
      color: #ea580c;
      padding: 5px 14px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 0.82rem;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(234, 88, 12, 0.1);
      transition: all 0.2s;
    }
    .btn-manage-subs:hover {
      background: #fff7ed;
      border-color: #ea580c;
      transform: translateY(-1px);
    }
    .sub-badge {
      background: #ea580c;
      color: white;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 1px 7px;
      border-radius: 20px;
    }

    /* Wide Modal */
    .modal-dialog-wide {
      max-width: 680px !important;
    }

    /* Form Section Blocks */
    .form-section-block {
      margin-bottom: 1.25rem;
    }
    .block-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 8px;
    }

    /* Duration Selector Grid */
    .sub-duration-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .sub-duration-card {
      position: relative;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 10px;
      cursor: pointer;
      background: white;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      text-align: center;
    }
    .sub-duration-card input {
      position: absolute;
      opacity: 0;
    }
    .sub-duration-card.selected {
      border-color: #ea580c;
      background: #fff8f5;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.12);
    }
    .dur-title {
      font-weight: 800;
      font-size: 0.85rem;
      color: #1e293b;
    }
    .dur-price {
      font-size: 1.15rem;
      font-weight: 800;
      color: #ea580c;
      margin: 4px 0 2px;
    }
    .dur-sub {
      font-size: 0.72rem;
      color: #64748b;
    }
    .dur-badge {
      position: absolute;
      top: -8px;
      right: 8px;
      background: #10b981;
      color: white;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .dur-badge.save {
      background: #8b5cf6;
    }

    /* Slot Selector Grid */
    .sub-slot-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .sub-slot-card {
      position: relative;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px;
      cursor: pointer;
      background: white;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .sub-slot-card input {
      position: absolute;
      opacity: 0;
    }
    .sub-slot-card.selected {
      border-color: #ea580c;
      background: #fff8f5;
    }
    .slot-icon {
      font-size: 1.25rem;
    }
    .slot-text strong {
      display: block;
      font-size: 0.82rem;
      color: #1e293b;
    }
    .slot-text span {
      display: block;
      font-size: 0.7rem;
      color: #64748b;
    }

    /* Modal Form Inputs */
    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .form-field {
      margin-bottom: 12px;
    }
    .form-field label {
      display: block;
      font-size: 0.78rem;
      font-weight: 700;
      color: #475569;
      margin-bottom: 4px;
    }
    .modal-input {
      width: 100%;
      padding: 9px 12px;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      font-size: 0.88rem;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .modal-input:focus {
      border-color: #ea580c;
      outline: none;
    }
    .modal-select {
      background: white;
      cursor: pointer;
    }
    .err-text {
      color: #dc2626;
      font-size: 0.72rem;
      font-weight: 600;
      margin-top: 3px;
      display: block;
    }

    /* Payment Method Row */
    .payment-method-row {
      display: flex;
      gap: 10px;
    }
    .pay-method-card {
      flex: 1;
      position: relative;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      color: #334155;
      background: white;
      transition: all 0.2s;
    }
    .pay-method-card input {
      position: absolute;
      opacity: 0;
    }
    .pay-method-card.selected {
      border-color: #ea580c;
      background: #fff8f5;
      color: #ea580c;
    }

    /* Pricing Summary */
    .sub-pricing-summary {
      background: #f8fafc;
      border-radius: 12px;
      padding: 14px 18px;
      margin-top: 1rem;
      border: 1px dashed #cbd5e1;
    }
    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.86rem;
      color: #475569;
      margin-bottom: 6px;
    }
    .summary-line.text-green {
      color: #16a34a;
    }
    .summary-line.line-total {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1.5px solid #e2e8f0;
      font-weight: 800;
      font-size: 1rem;
      color: #1e293b;
    }
    .total-highlight {
      color: #ea580c;
      font-size: 1.3rem;
    }

    /* Success Modal */
    .success-icon-badge {
      font-size: 3rem;
      margin-bottom: 8px;
    }
    .success-modal-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 4px;
    }
    .success-modal-desc {
      color: #64748b;
      font-size: 0.9rem;
      margin-bottom: 1.25rem;
    }
    .success-order-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 18px;
      text-align: left;
      margin-bottom: 1.25rem;
    }
    .succ-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.86rem;
      margin-bottom: 6px;
    }
    .succ-row .lbl {
      color: #64748b;
      font-weight: 600;
    }
    .kitchen-support-info {
      font-size: 0.85rem;
      color: #475569;
      margin-bottom: 1.5rem;
    }
    .modal-success-btn-group {
      display: flex;
      gap: 10px;
      justify-content: center;
    }

    /* Customer Subscriptions List */
    .subs-lookup-bar {
      display: flex;
      gap: 8px;
      margin-bottom: 1.25rem;
    }
    .lookup-input-box {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }
    .lookup-icon {
      position: absolute;
      left: 12px;
      font-size: 1rem;
    }
    .lookup-input {
      width: 100%;
      padding: 10px 12px 10px 38px;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      font-size: 0.9rem;
      box-sizing: border-box;
    }
    .subs-loading-state, .subs-empty-state {
      text-align: center;
      padding: 30px 20px;
      color: #64748b;
    }
    .empty-icon-lg {
      font-size: 3rem;
      margin-bottom: 8px;
    }
    .subs-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
      max-height: 55vh;
      overflow-y: auto;
      padding-right: 4px;
    }
    .sub-item-card {
      background: white;
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      transition: all 0.2s;
    }
    .sub-item-card.sub-paused {
      border-color: #fde68a;
      background: #fffdf5;
    }
    .sub-item-card.sub-cancelled {
      border-color: #fca5a5;
      background: #fffafa;
      opacity: 0.85;
    }
    .sub-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .order-id-badge {
      font-family: monospace;
      font-weight: 800;
      color: #ea580c;
      background: #ffedd5;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.8rem;
    }
    .sub-created-date {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-left: 8px;
    }
    .sub-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 50px;
      font-size: 0.78rem;
      font-weight: 800;
    }
    .sub-status-pill.status-active {
      background: #dcfce7;
      color: #15803d;
    }
    .sub-status-pill.status-paused {
      background: #fef3c7;
      color: #b45309;
    }
    .sub-status-pill.status-completed {
      background: #f1f5f9;
      color: #475569;
    }
    .sub-status-pill.status-cancelled {
      background: #fee2e2;
      color: #b91c1c;
    }
    .sub-details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 14px;
      font-size: 0.85rem;
    }
    .detail-cell.col-span-2 {
      grid-column: span 2;
    }
    .c-lbl {
      display: block;
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .sub-actions-bar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      padding-top: 10px;
      border-top: 1px solid #f1f5f9;
    }
    .btn-sub-act {
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      border: 1.5px solid transparent;
      transition: all 0.2s;
    }
    .btn-pause {
      background: #fef3c7;
      color: #b45309;
      border-color: #fde68a;
    }
    .btn-pause:hover {
      background: #fde68a;
    }
    .btn-resume {
      background: #dcfce7;
      color: #15803d;
      border-color: #86efac;
    }
    .btn-resume:hover {
      background: #bbf7d0;
    }
    .btn-edit {
      background: white;
      color: #1e293b;
      border-color: #cbd5e1;
    }
    .btn-edit:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }
    .btn-cancel {
      background: #fee2e2;
      color: #b91c1c;
      border-color: #fca5a5;
    }
    .btn-cancel:hover {
      background: #fecaca;
    }
    .btn-resub {
      background: #ea580c;
      color: white;
    }
    .btn-resub:hover {
      background: #c2410c;
    }
  `]
})
export class CmsThalisComponent implements OnInit {
  @Input() section!: CmsSection;

  plans: TiffinPlan[] = [];
  isLoading = true;
  selectedDuration: 'trial' | 'weekly' | 'monthly' = 'weekly';

  cartToastMessage = '';
  activeCustomizingPlan: TiffinPlan | null = null;

  availableAddons: PlanAddonOption[] = [
    { id: 'ad-roti', name: '2 Extra Desi Ghee Phulkas', category: 'Breads', price: 20, description: '100% Whole wheat soft rotis', quantity: 0 },
    { id: 'ad-curd', name: 'Fresh Dahi / Boondi Raita', category: 'Sides & Drinks', price: 25, description: 'Chilled homestyle curd', quantity: 0 },
    { id: 'ad-sweet', name: 'Gulab Jamun (2 Pcs)', category: 'Desserts & Sweets', price: 35, description: 'Warm desi ghee gulab jamun', quantity: 0 },
    { id: 'ad-paneer', name: 'Extra Paneer Sabzi Cup', category: 'Curries & Dals', price: 50, description: 'Rich gravy paneer portion', quantity: 0 }
  ];

  public tiffinService = inject(TiffinService);
  public cartService = inject(CartService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // --- RECURRING SUBSCRIPTION CHECKOUT FLOW ---
  isSubscribeModalOpen = false;
  activeSubscribePlan: TiffinPlan | null = null;
  subscribeDuration: 'trial' | 'weekly' | 'monthly' = 'weekly';
  subscribeMealSlot: 'lunch' | 'dinner' | 'both' = 'both';

  subCustomerName = '';
  subCustomerPhone = '';
  subCustomerEmail = '';
  subStreet = '';
  subLandmark = '';
  subArea = '';
  subCity = 'Meerut';
  subPincode = '250002';
  subStartDate = '';
  subSpecialInstructions = '';
  subPaymentMethod: 'cod' | 'upi' = 'cod';
  subFormErrors: { [key: string]: string } = {};

  isSubmittingSubscribe = false;
  isSubscribeSuccessModalOpen = false;
  confirmedSubscription: any = null;

  // --- MY SUBSCRIPTIONS & MANAGEMENT FLOW ---
  isMySubsModalOpen = false;
  userSubscriptions: any[] = [];
  isLoadingMySubs = false;
  subsLookupPhone = '';
  mySubsSearchPerformed = false;

  // --- EDIT SUBSCRIPTION MODAL ---
  isEditSubModalOpen = false;
  editingSub: any = null;
  editMealSlot: 'lunch' | 'dinner' | 'both' = 'both';
  editStreet = '';
  editArea = '';
  editLandmark = '';
  editSpecialInstructions = '';
  isSavingEditSub = false;

  areasInMeerut = [
    'Shastri Nagar',
    'Saket',
    'Budhana Gate / Bhatwara',
    'Mangal Pandey Nagar',
    'Ganga Nagar',
    'Modipuram',
    'Pallavpuram',
    'Sadar Bazaar',
    'Begum Bridge Road',
    'Medical College Road',
    'Roorkee Road',
    'Delhi Road',
    'Jagriti Vihar',
    'Civil Lines',
    'Other Area in Meerut'
  ];

  ngOnInit() {
    // Prefill customer details from auth or local storage
    const user = this.authService.getCurrentUser();
    if (user) {
      if (user.name) this.subCustomerName = user.name;
      if (user.phone) this.subCustomerPhone = user.phone;
      if (user.email) this.subCustomerEmail = user.email;
    }
    const savedPhone = typeof localStorage !== 'undefined' ? (localStorage.getItem('foodybhai_user_phone') || '') : '';
    if (savedPhone && !this.subCustomerPhone) {
      this.subCustomerPhone = savedPhone;
    }
    const savedName = typeof localStorage !== 'undefined' ? (localStorage.getItem('foodybhai_user_name') || '') : '';
    if (savedName && !this.subCustomerName) {
      this.subCustomerName = savedName;
    }
    this.subsLookupPhone = this.subCustomerPhone;
    if (this.subCustomerPhone) {
      this.loadUserSubscriptions(false);
    }

    this.tiffinService.getPlans().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.plans = (data || []).filter(p => p.isActive !== false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getPriceForDuration(plan: TiffinPlan): number {
    switch (this.selectedDuration) {
      case 'trial': return plan.trialPrice || 99;
      case 'weekly': return plan.weeklyPrice || 649;
      case 'monthly': return plan.monthlyPrice || 2399;
      default: return plan.weeklyPrice;
    }
  }

  trackBySlug(index: number, plan: TiffinPlan): string {
    return plan.slug || plan._id || index.toString();
  }

  onSelectPlan(plan: TiffinPlan) {
    this.openSubscribeModal(plan);
  }

  getPriceForPlanDuration(plan: TiffinPlan | null, duration: 'trial' | 'weekly' | 'monthly'): number {
    if (!plan) return 0;
    if (duration === 'trial') return plan.trialPrice || 99;
    if (duration === 'weekly') return plan.weeklyPrice || Math.round((plan.trialPrice || 99) * 6.5);
    return plan.monthlyPrice || Math.round((plan.trialPrice || 99) * 25);
  }

  getSubscribePrice(): number {
    if (!this.activeSubscribePlan) return 0;
    const base = this.getPriceForPlanDuration(this.activeSubscribePlan, this.subscribeDuration);
    if (this.subscribeMealSlot === 'both') {
      return Math.round(base * 1.9);
    }
    return base;
  }

  getCalculatedSubscribeMealsCount(): number {
    const multiplier = this.subscribeMealSlot === 'both' ? 2 : 1;
    if (this.subscribeDuration === 'trial') return 1 * multiplier;
    if (this.subscribeDuration === 'weekly') return 7 * multiplier;
    return 30 * multiplier;
  }

  openSubscribeModal(plan: TiffinPlan, event?: Event) {
    if (event) event.stopPropagation();
    this.activeSubscribePlan = plan;
    this.subscribeDuration = this.selectedDuration;
    this.subFormErrors = {};
    if (!this.subStartDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.subStartDate = tomorrow.toISOString().split('T')[0];
    }
    this.isSubscribeModalOpen = true;
  }

  closeSubscribeModal() {
    this.isSubscribeModalOpen = false;
  }

  validateSubscribeForm(): boolean {
    this.subFormErrors = {};
    if (!this.subCustomerName.trim()) this.subFormErrors['name'] = 'Full Name is required';
    const phonePattern = /^[6-9]\d{9}$/;
    const cleanPhone = this.subCustomerPhone.replace(/[\s\-\+]/g, '').slice(-10);
    if (!phonePattern.test(cleanPhone)) {
      this.subFormErrors['phone'] = 'Please enter a valid 10-digit mobile number';
    }
    if (!this.subStreet.trim()) this.subFormErrors['street'] = 'House/flat/street address is required';
    if (!this.subArea) this.subFormErrors['area'] = 'Please select your area in Meerut';
    if (!this.subStartDate) this.subFormErrors['startDate'] = 'Please select a starting date';
    return Object.keys(this.subFormErrors).length === 0;
  }

  submitSubscription() {
    if (!this.validateSubscribeForm() || !this.activeSubscribePlan) return;

    this.isSubmittingSubscribe = true;
    const cleanPhone = this.subCustomerPhone.replace(/[\s\-\+]/g, '').slice(-10);
    const cleanName = this.subCustomerName.trim();

    const payload: any = {
      customerName: cleanName,
      customerPhone: cleanPhone,
      customerEmail: this.subCustomerEmail.trim() || undefined,
      planId: this.activeSubscribePlan._id || this.activeSubscribePlan.slug,
      planName: this.activeSubscribePlan.name,
      subscriptionType: this.subscribeDuration,
      mealSlot: this.subscribeMealSlot,
      startDate: this.subStartDate,
      totalMeals: this.getCalculatedSubscribeMealsCount(),
      totalAmount: this.getSubscribePrice(),
      deliveryAddress: {
        street: this.subStreet.trim(),
        landmark: this.subLandmark.trim() || undefined,
        area: this.subArea,
        city: this.subCity || 'Meerut',
        pincode: this.subPincode || '250002'
      },
      specialInstructions: this.subSpecialInstructions.trim() || undefined,
      paymentMethod: this.subPaymentMethod
    };

    this.tiffinService.createSubscription(payload).subscribe({
      next: (res) => {
        this.isSubmittingSubscribe = false;
        this.confirmedSubscription = res;
        this.closeSubscribeModal();
        this.isSubscribeSuccessModalOpen = true;

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('foodybhai_user_phone', cleanPhone);
          localStorage.setItem('foodybhai_user_name', cleanName);
        }
        this.subsLookupPhone = cleanPhone;
        this.loadUserSubscriptions(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSubmittingSubscribe = false;
        alert('Could not complete subscription right now. Please try again or call kitchen.');
        this.cdr.detectChanges();
      }
    });
  }

  closeSubscribeSuccessModal() {
    this.isSubscribeSuccessModalOpen = false;
    this.confirmedSubscription = null;
  }

  openMySubscriptionsModal() {
    this.isMySubsModalOpen = true;
    const phone = this.subsLookupPhone || this.subCustomerPhone || (typeof localStorage !== 'undefined' ? (localStorage.getItem('foodybhai_user_phone') || '') : '');
    if (phone) {
      this.subsLookupPhone = phone;
      this.loadUserSubscriptions(false);
    }
  }

  closeMySubscriptionsModal() {
    this.isMySubsModalOpen = false;
  }

  loadUserSubscriptions(manualSearch: boolean = false) {
    const rawPhone = (this.subsLookupPhone || this.subCustomerPhone || (typeof localStorage !== 'undefined' ? (localStorage.getItem('foodybhai_user_phone') || '') : '')).trim();
    if (!rawPhone) {
      if (manualSearch) this.mySubsSearchPerformed = true;
      return;
    }

    const cleanPhone = rawPhone.replace(/[\s\-\+]/g, '').slice(-10);
    this.isLoadingMySubs = true;
    if (manualSearch) this.mySubsSearchPerformed = true;

    this.tiffinService.getMyOrders(cleanPhone).subscribe({
      next: (orders) => {
        this.userSubscriptions = orders || [];
        this.isLoadingMySubs = false;
        if (typeof localStorage !== 'undefined' && cleanPhone) {
          localStorage.setItem('foodybhai_user_phone', cleanPhone);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingMySubs = false;
        this.cdr.detectChanges();
      }
    });
  }

  togglePauseSubscription(sub: any) {
    const nextStatus = sub.status === 'paused' ? 'active' : 'paused';
    const subId = sub._id || sub.orderId;
    this.tiffinService.updateOrderStatus(subId, nextStatus).subscribe({
      next: () => {
        sub.status = nextStatus;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Failed to update subscription status. Please try again.');
      }
    });
  }

  cancelSubscription(sub: any) {
    const confirmCancel = confirm(
      'Are you sure you want to cancel your tiffin subscription?\n\nTip: You can pause deliveries instead if you are temporarily unavailable or going out of town.'
    );
    if (!confirmCancel) return;

    const subId = sub._id || sub.orderId;
    this.tiffinService.updateOrderStatus(subId, 'cancelled').subscribe({
      next: () => {
        sub.status = 'cancelled';
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Failed to cancel subscription. Please try again.');
      }
    });
  }

  openEditSubModal(sub: any) {
    this.editingSub = sub;
    this.editMealSlot = sub.mealSlot || 'both';
    this.editStreet = sub.deliveryAddress?.street || '';
    this.editArea = sub.deliveryAddress?.area || '';
    this.editLandmark = sub.deliveryAddress?.landmark || '';
    this.editSpecialInstructions = sub.specialInstructions || '';
    this.isEditSubModalOpen = true;
  }

  closeEditSubModal() {
    this.isEditSubModalOpen = false;
    this.editingSub = null;
  }

  saveSubscriptionChanges() {
    if (!this.editingSub) return;
    if (!this.editStreet.trim() || !this.editArea) {
      alert('Please provide street address and area in Meerut.');
      return;
    }

    this.isSavingEditSub = true;
    const subId = this.editingSub._id || this.editingSub.orderId;
    const updates = {
      mealSlot: this.editMealSlot,
      deliveryAddress: {
        street: this.editStreet.trim(),
        area: this.editArea,
        landmark: this.editLandmark.trim() || undefined,
        city: this.editingSub.deliveryAddress?.city || 'Meerut',
        pincode: this.editingSub.deliveryAddress?.pincode || '250002'
      },
      specialInstructions: this.editSpecialInstructions.trim() || undefined
    };

    this.tiffinService.updateOrderDetails(subId, updates).subscribe({
      next: () => {
        this.isSavingEditSub = false;
        this.editingSub.mealSlot = this.editMealSlot;
        this.editingSub.deliveryAddress = updates.deliveryAddress;
        this.editingSub.specialInstructions = updates.specialInstructions;
        this.closeEditSubModal();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSavingEditSub = false;
        alert('Failed to save subscription changes. Please try again.');
        this.cdr.detectChanges();
      }
    });
  }

  resubscribePlan(sub: any) {
    const matchedPlan = this.plans.find(p => p.name === sub.planName || p._id === sub.planId || p.slug === sub.planId);
    this.closeMySubscriptionsModal();
    if (matchedPlan) {
      this.openSubscribeModal(matchedPlan);
    } else if (this.plans.length > 0) {
      this.openSubscribeModal(this.plans[0]);
    }
  }

  openCustomizeModal(plan: TiffinPlan, event?: Event) {
    if (event) event.stopPropagation();
    this.activeCustomizingPlan = plan;
    this.availableAddons.forEach(a => a.quantity = 0);
  }

  closeCustomizeModal() {
    this.activeCustomizingPlan = null;
  }

  incrementAddon(addon: PlanAddonOption) {
    if (addon.quantity < 10) addon.quantity++;
  }

  decrementAddon(addon: PlanAddonOption) {
    if (addon.quantity > 0) addon.quantity--;
  }

  getCustomizedTotalPrice(): number {
    if (!this.activeCustomizingPlan) return 0;
    const addonsTotal = this.availableAddons.reduce((sum, a) => sum + (a.price * a.quantity), 0);
    return (this.activeCustomizingPlan.trialPrice || 99) + addonsTotal;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  private convertPlanToRecipe(plan: TiffinPlan): Recipe {
    return {
      id: plan._id ? Math.abs(this.hashCode(plan._id)) : Math.floor(1000 + Math.random() * 9000),
      _id: plan._id,
      slug: plan.slug || 'thali-' + Date.now(),
      title: plan.name,
      description: plan.description || plan.tagline || 'Homemade delicious thali',
      introduction: plan.tagline || plan.description || 'Delicious freshly prepared homemade meal',
      price: plan.trialPrice || 99,
      image: plan.image || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
      imageAlt: plan.name,
      category: 'Thalis And Mini Meals',
      cuisine: 'North Indian',
      isVeg: plan.dietaryType === 'veg',
      inStock: true,
      prepTime: '20 mins',
      cookTime: '15 mins',
      totalTime: '35 mins',
      servings: 1,
      difficulty: 'Easy',
      ingredients: plan.items || [],
      instructions: [],
      tips: plan.features || [],
      seoTitle: plan.name,
      seoDescription: plan.tagline || plan.description
    };
  }

  confirmAddToCartWithCustomization() {
    if (!this.activeCustomizingPlan) return;

    // Convert plan to cart item
    const baseRecipe: Recipe = this.convertPlanToRecipe(this.activeCustomizingPlan);
    this.cartService.addToCart(baseRecipe);

    // Add selected extras
    this.availableAddons.forEach(addon => {
      if (addon.quantity > 0) {
        const addonRecipe: Recipe = {
          id: Math.abs(this.hashCode(addon.id)),
          _id: addon.id,
          slug: addon.id,
          title: `${addon.name} (Addon)`,
          description: addon.description,
          introduction: addon.description || 'Thali add-on accompaniment',
          price: addon.price,
          image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80',
          imageAlt: addon.name,
          category: 'Thalis And Mini Meals',
          cuisine: 'North Indian',
          isVeg: true,
          inStock: true,
          prepTime: '10 mins',
          cookTime: '5 mins',
          totalTime: '15 mins',
          servings: 1,
          difficulty: 'Easy',
          ingredients: [addon.name],
          instructions: [],
          tips: [],
          seoTitle: addon.name,
          seoDescription: addon.description
        };
        for (let i = 0; i < addon.quantity; i++) {
          this.cartService.addToCart(addonRecipe);
        }
      }
    });

    const planName = this.activeCustomizingPlan.name;
    this.closeCustomizeModal();
    this.showCartToast(`🍱 "${planName}" added to cart!`);
  }

  showCartToast(msg: string) {
    this.cartToastMessage = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.cartToastMessage = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}

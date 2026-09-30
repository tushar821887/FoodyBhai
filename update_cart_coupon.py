with open("src/app/components/cart/cart.html", "r") as f:
    content = f.read()

import re

new_coupon_html = """
    <div class="cart-coupon mb-4">
      @if (cartService.coupon$ | async) {
        <div class="applied-coupon">
          <div class="ac-left">
            <i class="fa-solid fa-circle-check"></i>
            <div>
              <strong>'{{cartService.coupon$ | async}}' applied</strong>
              <span>You are saving ₹{{cartService.discount$ | async}}</span>
            </div>
          </div>
          <button class="remove-coupon-btn" (click)="removeCoupon()">Remove</button>
        </div>
      } @else {
        <div class="coupon-wrapper" [class.has-error]="couponError">
          <i class="fa-solid fa-percent coupon-icon"></i>
          <input type="text" [(ngModel)]="couponInput" placeholder="Enter coupon code" class="coupon-input">
          <button class="apply-coupon-btn" (click)="applyCoupon()">APPLY</button>
        </div>
        @if (couponError) {
          <small class="coupon-error-msg"><i class="fa-solid fa-circle-exclamation"></i> {{couponError}}</small>
        }
      }
    </div>

    <div class="cart-total" style="flex-direction: column; gap: 0.8rem; align-items: stretch; margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; font-size: 0.95rem; color: var(--text-dark);">
        <span>Item Total</span>
        <span>₹{{cartService.totalPrice$ | async}}</span>
      </div>
      @if ((cartService.discount$ | async)! > 0) {
        <div style="display: flex; justify-content: space-between; color: var(--success); font-size: 0.95rem; font-weight: 500;">
          <span>Item Discount</span>
          <span>-₹{{cartService.discount$ | async}}</span>
        </div>
      }
      <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1.3rem; margin-top: 0.5rem; border-top: 2px dashed rgba(0,0,0,0.08); padding-top: 1rem; color: var(--secondary-color);">
        <span>To Pay</span>
        <span>₹{{cartService.finalPrice$ | async}}</span>
      </div>
    </div>
"""

content = re.sub(r'    <div class="cart-coupon mb-3">.*?    </div>\s*<div class="cart-total".*?</div>\s*</div>', new_coupon_html, content, flags=re.DOTALL)

with open("src/app/components/cart/cart.html", "w") as f:
    f.write(content)

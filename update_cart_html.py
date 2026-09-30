with open("src/app/components/cart/cart.html", "r") as f:
    content = f.read()

coupon_html = """
    <div class="cart-coupon mb-3">
      @if (cartService.coupon$ | async) {
        <div class="applied-coupon" style="display: flex; justify-content: space-between; align-items: center; background: rgba(46, 213, 115, 0.1); padding: 0.8rem; border-radius: 8px; border: 1px dashed var(--success);">
          <div style="color: var(--success); font-weight: 600;">
            <i class="fa-solid fa-tag"></i> {{cartService.coupon$ | async}} Applied!
          </div>
          <button style="background: none; border: none; color: var(--danger); cursor: pointer;" (click)="removeCoupon()"><i class="fa-solid fa-xmark"></i></button>
        </div>
      } @else {
        <div class="input-group" style="display: flex; gap: 0.5rem;">
          <input type="text" [(ngModel)]="couponInput" class="form-control" placeholder="Enter coupon code" style="flex: 1;">
          <button class="btn btn-outline" style="padding: 0.5rem 1rem;" (click)="applyCoupon()">Apply</button>
        </div>
        @if (couponError) {
          <small class="text-danger" style="color: var(--danger); display: block; margin-top: 0.3rem;">{{couponError}}</small>
        }
        @if (couponSuccess) {
          <small class="text-success" style="color: var(--success); display: block; margin-top: 0.3rem;">{{couponSuccess}}</small>
        }
      }
    </div>

    <div class="cart-total" style="flex-direction: column; gap: 0.5rem; align-items: stretch;">
      <div style="display: flex; justify-content: space-between;">
        <span>Subtotal</span>
        <span>₹{{cartService.totalPrice$ | async}}</span>
      </div>
      @if ((cartService.discount$ | async)! > 0) {
        <div style="display: flex; justify-content: space-between; color: var(--success);">
          <span>Discount ({{cartService.coupon$ | async}})</span>
          <span>-₹{{cartService.discount$ | async}}</span>
        </div>
      }
      <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.2rem; margin-top: 0.5rem; border-top: 1px dashed rgba(0,0,0,0.1); padding-top: 0.5rem;">
        <span>Total</span>
        <span>₹{{cartService.finalPrice$ | async}}</span>
      </div>
    </div>
"""

import re
content = re.sub(r'    <div class="cart-total">.*?</div>', coupon_html, content, flags=re.DOTALL)

with open("src/app/components/cart/cart.html", "w") as f:
    f.write(content)

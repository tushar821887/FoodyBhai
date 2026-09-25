with open("src/app/components/cart/cart.html", "r") as f:
    content = f.read()

import re

# Update footer button area
footer_html = """  @if ((cartService.items$ | async)?.length! > 0) {
    <div class="cart-footer">
      @if ((cartService.totalPrice$ | async)! < 100) {
        <div class="min-order-warning" style="background: rgba(255,193,7,0.15); color: #b78100; padding: 0.8rem; border-radius: 8px; text-align: center; margin-bottom: 1rem; font-size: 0.9rem; font-weight: 500;">
          <i class="fa-solid fa-circle-info"></i> Add items worth ₹{{100 - (cartService.totalPrice$ | async)!}} more to checkout
        </div>
      }
      
      <button class="btn btn-primary checkout-btn" [disabled]="(cartService.totalPrice$ | async)! < 100" (click)="openCheckoutModal()" [style.opacity]="(cartService.totalPrice$ | async)! < 100 ? '0.5' : '1'" [style.cursor]="(cartService.totalPrice$ | async)! < 100 ? 'not-allowed' : 'pointer'">
        Proceed to Checkout
      </button>
    </div>
  }
"""

content = re.sub(r'  @if \(\(cartService\.items\$ \| async\)\?\.length! > 0\) \{\n    <div class="cart-footer">\n      <button class="btn btn-primary checkout-btn" \(click\)="openCheckoutModal\(\)">\n        Proceed to Checkout\n      </button>\n    </div>\n  \}', footer_html, content, flags=re.DOTALL)

with open("src/app/components/cart/cart.html", "w") as f:
    f.write(content)

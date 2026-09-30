with open("src/app/components/cart/cart.ts", "r") as f:
    content = f.read()

import re

# Add minimum order checking to checkout and applyCoupon
coupon_logic = """  applyCoupon() {
    this.couponError = '';
    this.couponSuccess = '';
    
    if (this.cartService.getCurrentTotal() < 100) {
      this.couponError = 'Minimum order of ₹100 required to apply coupon.';
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
  }"""

content = re.sub(r'  applyCoupon\(\) \{.*?  \}', coupon_logic, content, flags=re.DOTALL)

with open("src/app/components/cart/cart.ts", "w") as f:
    f.write(content)

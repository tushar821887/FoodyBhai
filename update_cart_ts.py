with open("src/app/components/cart/cart.ts", "r") as f:
    content = f.read()

coupon_code = """  couponInput = '';
  couponError = '';
  couponSuccess = '';

  applyCoupon() {
    this.couponError = '';
    this.couponSuccess = '';
    
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
"""

content = content.replace("  constructor(public cartService: CartService) {}", "  constructor(public cartService: CartService) {}\n\n" + coupon_code)

with open("src/app/components/cart/cart.ts", "w") as f:
    f.write(content)

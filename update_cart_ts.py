with open("src/app/components/cart/cart.ts", "r") as f:
    content = f.read()

import re
methods = """  decreaseQuantity(item: CartItem) {
    this.cartService.updateQuantity(item.recipe.id, item.quantity - 1);
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.recipe.id);
  }"""

content = content.replace("  decreaseQuantity(item: CartItem) {\n    this.cartService.updateQuantity(item.recipe.id, item.quantity - 1);\n  }", methods)

with open("src/app/components/cart/cart.ts", "w") as f:
    f.write(content)

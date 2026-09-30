with open("src/app/services/cart.service.ts", "r") as f:
    content = f.read()

import re

# Add getCurrentTotal method
methods = """  getCurrentTotal(): number {
    return this.itemsSubject.value.reduce((total, item) => total + ((item.recipe.price || 0) * item.quantity), 0);
  }

  applyCoupon(code: string): boolean {"""

content = content.replace("  applyCoupon(code: string): boolean {", methods)

with open("src/app/services/cart.service.ts", "w") as f:
    f.write(content)

with open("src/app/components/cart/cart.ts", "r") as f:
    content = f.read()

import re

open_modal_logic = """  openCheckoutModal() {
    if (this.cartService.getCurrentTotal() < 100) {
      alert("Minimum order value is ₹100");
      return;
    }
    this.showCheckoutModal = true;
  }"""

content = re.sub(r'  openCheckoutModal\(\) \{\n    this\.showCheckoutModal = true;\n  \}', open_modal_logic, content, flags=re.DOTALL)

with open("src/app/components/cart/cart.ts", "w") as f:
    f.write(content)

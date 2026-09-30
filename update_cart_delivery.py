with open("src/app/components/cart/cart.html", "r") as f:
    content = f.read()

import re

new_total = """      <div style="display: flex; justify-content: space-between; font-size: 0.95rem; color: var(--text-dark);">
        <span>Item Total</span>
        <span>₹{{cartService.totalPrice$ | async}}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.95rem; color: var(--success);">
        <span>Delivery Fee</span>
        <span style="font-weight: 700;">FREE</span>
      </div>"""

content = content.replace("""      <div style="display: flex; justify-content: space-between; font-size: 0.95rem; color: var(--text-dark);">
        <span>Item Total</span>
        <span>₹{{cartService.totalPrice$ | async}}</span>
      </div>""", new_total)

with open("src/app/components/cart/cart.html", "w") as f:
    f.write(content)

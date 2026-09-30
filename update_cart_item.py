with open("src/app/components/cart/cart.html", "r") as f:
    content = f.read()

import re
new_cart_item = """          <div class="cart-item">
            <div class="item-info">
              <h4 class="item-title">{{item.recipe.title}}</h4>
              <p class="item-price">₹{{item.recipe.price}}</p>
            </div>
            <div class="item-actions-right" style="display: flex; align-items: center; gap: 0.8rem;">
              <div class="quantity-controls">
                <button (click)="decreaseQuantity(item)"><i class="fa-solid fa-minus"></i></button>
                <span>{{item.quantity}}</span>
                <button (click)="increaseQuantity(item)"><i class="fa-solid fa-plus"></i></button>
              </div>
              <button class="delete-item-btn" (click)="removeItem(item)" title="Remove item" style="background: none; border: none; color: #ff4757; font-size: 1.1rem; cursor: pointer; padding: 0.3rem; opacity: 0.7; transition: 0.2s;"><i class="fa-solid fa-trash-can"></i></button>
            </div>
          </div>"""

content = re.sub(r'          <div class="cart-item">.*?</div>\n          </div>', new_cart_item, content, flags=re.DOTALL)

with open("src/app/components/cart/cart.html", "w") as f:
    f.write(content)

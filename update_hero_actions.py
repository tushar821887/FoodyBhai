with open("src/app/components/hero/hero.html", "r") as f:
    content = f.read()

import re

new_actions = """      <div class="hero-actions" style="flex-wrap: wrap; gap: 1rem;">
        <a routerLink="/menu" class="btn btn-primary btn-lg">Order Here <i class="fa-solid fa-arrow-right"></i></a>
        <a href="https://www.zomato.com/meerut/foody-bhai-mohan-puri/order" target="_blank" class="btn btn-lg" style="background: #e23744; color: white; border: none; box-shadow: 0 4px 15px rgba(226, 55, 68, 0.3);">
          <strong style="font-style: italic; font-weight: 800; font-size: 1.2rem; letter-spacing: 0.5px;">zomato</strong>
        </a>
        <a href="https://www.swiggy.com/" target="_blank" class="btn btn-lg" style="background: #fc8019; color: white; border: none; box-shadow: 0 4px 15px rgba(252, 128, 25, 0.3);">
          <strong style="font-weight: 800; font-size: 1.2rem; letter-spacing: 0.5px;">SWIGGY</strong>
        </a>
      </div>"""

content = re.sub(r'      <div class="hero-actions">\n        <a routerLink="/menu" class="btn btn-primary btn-lg">Order Now <i class="fa-solid fa-arrow-right"></i></a>\n        <a routerLink="/about" class="btn btn-secondary btn-lg">Know More</a>\n      </div>', new_actions, content, flags=re.DOTALL)

with open("src/app/components/hero/hero.html", "w") as f:
    f.write(content)

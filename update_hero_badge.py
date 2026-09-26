with open("src/app/components/hero/hero.html", "r") as f:
    content = f.read()

import re

new_badge = """      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 1.5rem;" class="hero-badges">
        <div class="badge delivery-badge" style="margin-bottom: 0;">
          <i class="fa-solid fa-motorcycle"></i> 100% Delivery Only
        </div>
        <div class="badge delivery-badge" style="margin-bottom: 0; background: var(--primary-color); color: white; border: none;">
          <i class="fa-solid fa-location-dot"></i> Delivering in Meerut Area Only
        </div>
      </div>"""

content = re.sub(r'      <div class="badge delivery-badge">\n        <i class="fa-solid fa-motorcycle"></i> 100% Delivery Only Restaurant\n      </div>', new_badge, content, flags=re.DOTALL)

with open("src/app/components/hero/hero.html", "w") as f:
    f.write(content)

with open("src/app/components/cart/cart.html", "r") as f:
    content = f.read()

import re

new_address = """          <div class="form-group-sm mb-4">
            <label>Complete Address *</label>
            <div class="input-with-icon align-top">
              <i class="fa-solid fa-location-dot" style="margin-top: 14px;"></i>
              <textarea [(ngModel)]="deliveryAddress" placeholder="House/Flat No., Street, Landmark..." class="form-control" rows="3" required></textarea>
            </div>
            <small style="display: block; margin-top: 8px; color: var(--primary-color); font-weight: 500; font-size: 0.82rem;"><i class="fa-solid fa-circle-info"></i> Note: We currently deliver in the Meerut area only.</small>
          </div>"""

content = re.sub(r'          <div class="form-group-sm mb-4">\n            <label>Complete Address \*\</label>\n            <div class="input-with-icon align-top">\n              <i class="fa-solid fa-location-dot" style="margin-top: 14px;"></i>\n              <textarea \[\(ngModel\)\]="deliveryAddress" placeholder="House/Flat No\., Street, Landmark\.\.\." class="form-control" rows="3" required></textarea>\n            </div>\n          </div>', new_address, content, flags=re.DOTALL)

with open("src/app/components/cart/cart.html", "w") as f:
    f.write(content)

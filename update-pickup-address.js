const fs = require('fs');
const path = 'frontend/src/app/pages/cart/cart.html';
let content = fs.readFileSync(path, 'utf8');

const pickupAddressHtml = `
                @if (orderType === 'pickup') {
                  <div class="form-group mb-2">
                    <label>Pickup Location</label>
                    <div class="p-3 bg-light rounded" style="border: 1px solid var(--border-color); display: flex; gap: 15px; align-items: flex-start;">
                      <div style="width: 40px; height: 40px; background: #fff0f2; color: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                        <i class="fa-solid fa-store"></i>
                      </div>
                      <div>
                        <h6 style="margin: 0 0 5px 0; font-weight: 700; color: #334155;">Foody Bhai Kitchen</h6>
                        <p style="margin: 0; color: #64748b; font-size: 0.95rem; line-height: 1.5;">123 Food Street, Phase 1<br>Meerut, Uttar Pradesh 250001</p>
                        <a href="https://maps.google.com" target="_blank" style="display: inline-block; margin-top: 8px; font-size: 0.85rem; font-weight: 600; color: var(--primary-color); text-decoration: none;"><i class="fa-solid fa-location-arrow"></i> Get Directions</a>
                      </div>
                    </div>
                  </div>
                }
`;

// Insert it right after the delivery block closes.
// The delivery block ends with:
//                  </div>
//                }
//                }

content = content.replace(/                  <\/div>\n                \}\n                \}/, `                  </div>
                }
                }
${pickupAddressHtml}`);

// Also in step 3 (Final Review), show the restaurant address if pickup.
const oldFinalAddressText = `                    @if (authService.isLoggedIn() && selectedAddress) {
                      {{ selectedAddress.fullAddress }} ({{ selectedAddress.label }})
                    } @else {
                      {{ deliveryAddress }}
                    }`;
const newFinalAddressText = `                    @if (orderType === 'pickup') {
                      Foody Bhai Kitchen, 123 Food Street, Meerut
                    } @else if (authService.isLoggedIn() && selectedAddress) {
                      {{ selectedAddress.fullAddress }} ({{ selectedAddress.label }})
                    } @else {
                      {{ deliveryAddress }}
                    }`;
content = content.replace(oldFinalAddressText, newFinalAddressText);

fs.writeFileSync(path, content);

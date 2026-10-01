const fs = require('fs');
const path = 'frontend/src/app/pages/cart/cart.html';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const pickupAddressHtml = `
                @if (orderType === 'pickup') {
                  <div class="form-group mb-2 mt-4">
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
                }`;

// Insert after line 140 (index 139)
lines.splice(140, 0, pickupAddressHtml);

fs.writeFileSync(path, lines.join('\n'));

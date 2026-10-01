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
                }`;

// 1. Remove it from Step 1
content = content.replace(pickupAddressHtml, '');
// Clean up the extra newline it left
content = content.replace(/                \}\n                \}\n\n\n              <\/div>/, `                }
                }
              </div>`);


// 2. Insert it into Step 2
// Look for the end of the Step 2 checkout form:
//                    <small class="text-muted mt-2 d-block"><i class="fa-solid fa-circle-info"></i> We deliver in Meerut area only.</small>
//                    
//                    <div class="mt-3 p-3 bg-light rounded text-center">
//                      <p class="mb-2 text-sm text-muted">Want to save your address for faster checkout?</p>
//                      <a href="javascript:void(0)" (click)="uiService.openAuthModal()" class="text-primary fw-bold" style="text-decoration: none;">Login or Register</a>
//                    </div>
//                  </div>
//                }
//                }
//              </div>
//            </div>
//          }
//          <!-- STEP 3: FINAL REVIEW -->

const target = `                    </div>
                  </div>
                }
                }`;

content = content.replace(target, target + '\\n' + pickupAddressHtml);

fs.writeFileSync(path, content);

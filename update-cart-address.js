const fs = require('fs');
const path = 'frontend/src/app/pages/cart/cart.html';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/<h4 class="cart-card-title"><i class="fa-solid fa-truck"><\/i> Delivery Details<\/h4>/, `<h4 class="cart-card-title"><i class="fa-solid" [ngClass]="orderType === 'delivery' ? 'fa-truck' : 'fa-person-walking-luggage'"></i> {{ orderType === 'delivery' ? 'Delivery Details' : 'Pickup Details' }}</h4>`);

const beforeAddressLogic = `                @if (authService.isLoggedIn()) {`;
const newAddressLogic = `                @if (orderType === 'delivery') {
                  @if (authService.isLoggedIn()) {`;

content = content.replace(beforeAddressLogic, newAddressLogic);

const endAddressLogic = `                  </div>
                }
              </div>
            </div>
          }`;
const newEndAddressLogic = `                  </div>
                }
                }
              </div>
            </div>
          }`;

content = content.replace(endAddressLogic, newEndAddressLogic);

const deliveryDetailsHeader = `<h5 class="m-0" style="color: var(--secondary-color);">Delivery Details</h5>`;
const newDeliveryDetailsHeader = `<h5 class="m-0" style="color: var(--secondary-color);">{{ orderType === 'delivery' ? 'Delivery Details' : 'Pickup Details' }}</h5>`;
content = content.replace(deliveryDetailsHeader, newDeliveryDetailsHeader);

const finalAddressText = `                    <p class="m-0 text-muted" style="font-size: 0.95rem;">
                      {{ deliveryAddress }}
                    </p>`;
const newFinalAddressText = `                    <p class="m-0 text-muted" style="font-size: 0.95rem;">
                      {{ orderType === 'pickup' ? 'Self Pickup' : (authService.isLoggedIn() ? selectedAddress?.fullAddress : deliveryAddress) }}
                    </p>`;
content = content.replace(finalAddressText, newFinalAddressText);

// Make Delivery Fee only show if delivery
const deliveryFee = `<div class="total-row text-success">
                <span>Delivery Fee</span>
                <span>FREE</span>
              </div>`;
const newDeliveryFee = `@if (orderType === 'delivery') {
              <div class="total-row text-success">
                <span>Delivery Fee</span>
                <span>FREE</span>
              </div>
              }`;
content = content.replace(deliveryFee, newDeliveryFee);

fs.writeFileSync(path, content);

const fs = require('fs');
const path = 'frontend/src/app/pages/cart/cart.html';
let content = fs.readFileSync(path, 'utf8');

const orderTypeHtml = `
                <div class="form-group mb-4 w-100">
                  <label style="display: block; margin-bottom: 8px;">Order Type *</label>
                  <div style="display: flex; gap: 10px;">
                    <label style="flex: 1; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.2s;" [style.border-color]="orderType === 'delivery' ? 'var(--primary-color)' : '#e2e8f0'" [style.background]="orderType === 'delivery' ? '#fff0f2' : 'transparent'">
                      <input type="radio" name="orderType" value="delivery" [(ngModel)]="orderType" style="display: none;">
                      <i class="fa-solid fa-motorcycle" style="margin-right: 5px;" [style.color]="orderType === 'delivery' ? 'var(--primary-color)' : '#64748b'"></i> 
                      <span [style.font-weight]="orderType === 'delivery' ? '600' : 'normal'" [style.color]="orderType === 'delivery' ? 'var(--primary-color)' : '#334155'">Delivery</span>
                    </label>
                    <label style="flex: 1; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.2s;" [style.border-color]="orderType === 'pickup' ? 'var(--primary-color)' : '#e2e8f0'" [style.background]="orderType === 'pickup' ? '#fff0f2' : 'transparent'">
                      <input type="radio" name="orderType" value="pickup" [(ngModel)]="orderType" style="display: none;">
                      <i class="fa-solid fa-person-walking-luggage" style="margin-right: 5px;" [style.color]="orderType === 'pickup' ? 'var(--primary-color)' : '#64748b'"></i> 
                      <span [style.font-weight]="orderType === 'pickup' ? '600' : 'normal'" [style.color]="orderType === 'pickup' ? 'var(--primary-color)' : '#334155'">Self Pickup</span>
                    </label>
                  </div>
                </div>
`;

content = content.replace(/<div class="form-row">/, '<div class="form-row">' + orderTypeHtml);

fs.writeFileSync(path, content);

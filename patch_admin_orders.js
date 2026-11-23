const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, 'admin-app', 'src', 'app', 'services', 'api.service.ts');
let apiContent = fs.readFileSync(apiPath, 'utf8');

apiContent = apiContent.replace(
  "  deliveryAgent?: { name: string; phone: string };",
  "  deliveryAgent?: { name: string; phone: string };\n  rating?: number;\n  review?: string;"
);
fs.writeFileSync(apiPath, apiContent);

const htmlPath = path.join(__dirname, 'admin-app', 'src', 'app', 'pages', 'orders', 'orders.page.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const oldOrderItems = `          <div class="order-items">
            <div class="item" *ngFor="let item of order.items">
              <span class="qty">{{ item.quantity }}x</span> {{ item.recipe.title || 'Custom Item' }}
              <span class="item-price" *ngIf="item.recipe.price">
                (₹{{ item.recipe.price }} = ₹{{ item.quantity * item.recipe.price }})
              </span>
            </div>
          </div>`;

const newOrderItems = `          <div class="order-items">
            <div class="item" *ngFor="let item of order.items">
              <span class="qty">{{ item.quantity }}x</span> {{ item.recipe.title || 'Custom Item' }}
              <span class="item-price" *ngIf="item.recipe.price">
                (₹{{ item.recipe.price }} = ₹{{ item.quantity * item.recipe.price }})
              </span>
            </div>
          </div>

          <div class="order-rating-box" *ngIf="order.rating" style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin: 12px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
              <strong style="color: #92400e; font-size: 14px;">Customer Feedback</strong>
              <div style="display: flex; gap: 3px; font-size: 14px;">
                <span *ngFor="let star of [1,2,3,4,5]" [style.opacity]="star <= order.rating ? '1' : '0.3'">⭐</span>
              </div>
            </div>
            <div style="font-size: 13px; color: #b45309; font-style: italic; margin-top: 4px;" *ngIf="order.review">
              "{{ order.review }}"
            </div>
          </div>`;

htmlContent = htmlContent.replace(oldOrderItems, newOrderItems);
fs.writeFileSync(htmlPath, htmlContent);

console.log('Fixed admin orders');

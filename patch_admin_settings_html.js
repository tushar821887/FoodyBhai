const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'admin-app/src/app/pages/orders/orders.page.html');
let content = fs.readFileSync(filePath, 'utf8');

const newCard = `
        <div class="settings-card" style="margin-bottom: 24px;">
          <div class="card-header-styled">
            <div class="icon-circle">🏪</div>
            <div>
              <h3>Restaurant Status</h3>
              <p>Control whether customers can place new orders.</p>
            </div>
          </div>
          
          <div class="settings-form-modern">
            <div class="form-group-modern" style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 15px; border-radius: 8px;">
              <div>
                <strong style="display: block; font-size: 16px;">Accepting Orders</strong>
                <span style="font-size: 13px; color: #64748b;">If turned off, checkout is disabled globally.</span>
              </div>
              <label class="switch" style="position: relative; display: inline-block; width: 50px; height: 28px;">
                <input type="checkbox" [(ngModel)]="restaurantOpen" (change)="saveSettings()" style="opacity: 0; width: 0; height: 0;">
                <span class="slider round" [class.active]="restaurantOpen" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 34px;">
                  <span class="knob" [style.transform]="restaurantOpen ? 'translateX(22px)' : 'translateX(0)'" style="position: absolute; content: ''; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;"></span>
                </span>
              </label>
            </div>
            
            <div class="form-group-modern" *ngIf="!restaurantOpen" style="margin-top: 15px; animation: fadeIn 0.3s;">
              <label>Reason for Closing</label>
              <select [(ngModel)]="restaurantClosedReason" (change)="saveSettings()" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px;">
                <option value="We are currently closed. Please check back later.">Standard Closing (Out of hours)</option>
                <option value="Too many orders! We are temporarily pausing new orders.">High volume of orders (Temporarily paused)</option>
                <option value="We are closed due to bad weather conditions.">Bad Weather</option>
                <option value="Closed for maintenance.">Maintenance</option>
              </select>
            </div>
          </div>
        </div>
`;

content = content.replace('<div class="settings-card">', newCard + '\n        <div class="settings-card">');
fs.writeFileSync(filePath, content);

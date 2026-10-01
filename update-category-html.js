const fs = require('fs');
const path = 'admin-app/src/app/pages/orders/orders.page.html';
let content = fs.readFileSync(path, 'utf8');

const oldHtml = `                <div *ngIf="editingCategory?.id !== cat.id">
                  <strong>{{ cat.name }}</strong>
                </div>`;
const newHtml = `                <div *ngIf="editingCategory?.id !== cat.id">
                  <strong>{{ cat.name }}</strong>
                  <span style="font-size: 13px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 12px; margin-left: 10px; font-weight: 600;">
                    {{ getItemCount(cat.name) }} items
                  </span>
                </div>`;

content = content.replace(oldHtml, newHtml);

fs.writeFileSync(path, content);

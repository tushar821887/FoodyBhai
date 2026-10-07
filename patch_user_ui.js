const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'admin-app', 'src', 'app', 'pages', 'orders', 'orders.page.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// 1. Fix the Add User button
const oldAddButton = `<button class="btn btn-primary" (click)="showAddUserModal = true">
              <i class="icon">➕</i> Add User
            </button>`;
const newAddButton = `<button (click)="showAddUserModal = true" style="background: #8b5cf6; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 15px rgba(139, 92, 246, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(139, 92, 246, 0.25)'">
              <span>➕</span> Add User
            </button>`;
content = content.replace(oldAddButton, newAddButton);

// 2. Fix the Edit/Delete button stacking
const oldButtons = `<div style="display: flex; flex-direction: column; gap: 8px;">
                <button style="color: #3b82f6; background: #eff6ff; border: none; cursor: pointer; font-weight: 600; padding: 6px 12px; border-radius: 6px;" (click)="editUser(user)">Edit</button>
                <button style="color: #ef4444; background: #fef2f2; border: none; cursor: pointer; font-weight: 600; padding: 6px 12px; border-radius: 6px;" (click)="deleteUser(user._id || user.id)">Delete</button>
              </div>`;
const newButtons = `<div style="display: flex; gap: 10px; align-items: center;">
                <button style="color: #0ea5e9; background: #e0f2fe; border: none; cursor: pointer; font-weight: 600; padding: 8px 16px; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='#bae6fd'" onmouseout="this.style.background='#e0f2fe'" (click)="editUser(user)">✏️ Edit</button>
                <button style="color: #ef4444; background: #fef2f2; border: none; cursor: pointer; font-weight: 600; padding: 8px 16px; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'" (click)="deleteUser(user._id || user.id)">🗑️ Delete</button>
              </div>`;
content = content.replace(oldButtons, newButtons);

fs.writeFileSync(htmlPath, content);
console.log('Fixed UI elements');

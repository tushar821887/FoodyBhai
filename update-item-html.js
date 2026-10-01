const fs = require('fs');
const path = 'admin-app/src/app/pages/orders/orders.page.html';
let content = fs.readFileSync(path, 'utf8');

// The "Add New Item" form currently looks like:
// <input type="text" [(ngModel)]="newItem.title" placeholder="Item Name" ...>
// <input type="number" [(ngModel)]="newItem.price" placeholder="Price (₹)" ...>
// <input type="text" [(ngModel)]="newItem.image" placeholder="Image URL (optional)" ...>
// <select [(ngModel)]="newItem.category" ...>

const newFormInputs = `<input type="text" [(ngModel)]="newItem.title" placeholder="Item Name" class="input-with-icon" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">
              <input type="number" [(ngModel)]="newItem.price" placeholder="Price (₹)" class="input-with-icon" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">
              <input type="text" [(ngModel)]="newItem.description" placeholder="Short Description (Required)" class="input-with-icon" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">
              <input type="text" [(ngModel)]="newItem.image" placeholder="Image URL (optional)" class="input-with-icon" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">
              <select [(ngModel)]="newItem.category" class="input-with-icon" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">`;

content = content.replace(/<input type="text" \[\(ngModel\)\]="newItem\.title"[\s\S]*?<select \[\(ngModel\)\]="newItem\.category" class="input-with-icon" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">/, newFormInputs);

fs.writeFileSync(path, content);

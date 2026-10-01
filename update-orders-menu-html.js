const fs = require('fs');
const path = 'admin-app/src/app/pages/orders/orders.page.html';
let content = fs.readFileSync(path, 'utf8');

// Sidebar link
content = content.replace(/<a class="nav-item">\n\s*<i class="icon">🍽️<\/i>\n\s*<span>Menu<\/span>\n\s*<\/a>/, `<a class="nav-item" [class.active]="currentView === 'menu'" (click)="setView('menu')">
        <i class="icon">🍽️</i>
        <span>Menu</span>
      </a>`);

const menuHtml = `
    <!-- MENU VIEW -->
    <ng-container *ngIf="currentView === 'menu'">
      <div class="settings-container animate-fade-in">
        <div class="settings-header-banner">
          <h2>Menu Management</h2>
          <p>Organize your categories and menu items.</p>
        </div>
        
        <div class="tabs-header" style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button class="tab-btn" [class.active]="menuTab === 'categories'" (click)="setMenuTab('categories')">Categories</button>
          <button class="tab-btn" [class.active]="menuTab === 'items'" (click)="setMenuTab('items')">Menu Items</button>
          <button class="tab-btn" [class.active]="menuTab === 'mapping'" (click)="setMenuTab('mapping')">Category Mapping</button>
        </div>

        <!-- CATEGORIES TAB -->
        <div *ngIf="menuTab === 'categories'">
          <div class="settings-card" style="margin-bottom: 20px;">
            <div class="card-header-styled">
              <div class="icon-circle">📁</div>
              <div><h3>Create Category</h3></div>
            </div>
            <div class="settings-form-modern">
              <div style="display: flex; gap: 10px;">
                <div class="input-with-icon" style="flex: 1;">
                  <input type="text" [(ngModel)]="newCategoryName" placeholder="Category Name (e.g. South Indian)" style="padding-left: 14px;">
                </div>
                <button class="btn-save-modern" style="padding: 10px 20px;" (click)="addCategory()">Add Category</button>
              </div>
            </div>
          </div>

          <div class="settings-card">
            <div class="card-header-styled">
              <div><h3>Existing Categories</h3></div>
            </div>
            <div style="padding: 20px;">
              <div *ngFor="let cat of categories" style="display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #e2e8f0;">
                <strong>{{ cat.name }}</strong>
                <button style="color: #ef4444; background: none; border: none; cursor: pointer; font-weight: 600;" (click)="deleteCategory(cat.id)">Delete</button>
              </div>
              <div *ngIf="categories.length === 0" style="color: #64748b;">No categories created yet.</div>
            </div>
          </div>
        </div>

        <!-- ITEMS TAB -->
        <div *ngIf="menuTab === 'items'">
          <div class="settings-card" style="margin-bottom: 20px;">
            <div class="card-header-styled">
              <div class="icon-circle">🍔</div>
              <div><h3>Add New Item</h3></div>
            </div>
            <div class="settings-form-modern" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <input type="text" [(ngModel)]="newItem.title" placeholder="Item Name" class="input-with-icon" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">
              <input type="number" [(ngModel)]="newItem.price" placeholder="Price (₹)" class="input-with-icon" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">
              <input type="text" [(ngModel)]="newItem.image" placeholder="Image URL (optional)" class="input-with-icon" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">
              <select [(ngModel)]="newItem.category" class="input-with-icon" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">
                <option value="">Select Category</option>
                <option *ngFor="let cat of categories" [value]="cat.name">{{ cat.name }}</option>
              </select>
              <label style="display: flex; align-items: center; gap: 10px; font-weight: 600;">
                <input type="checkbox" [(ngModel)]="newItem.isVeg" style="width: 20px; height: 20px;"> Vegetarian?
              </label>
              <button class="btn-save-modern" style="grid-column: 1 / -1; justify-content: center;" (click)="addRecipe()">Save Item</button>
            </div>
          </div>

          <div class="settings-card">
            <div class="card-header-styled">
              <div><h3>All Items</h3></div>
            </div>
            <div style="padding: 20px;">
              <div *ngFor="let item of recipes" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #e2e8f0;">
                <div>
                  <strong style="font-size: 16px;">{{ item.title }}</strong> <span style="color: #10b981; font-weight: bold; margin-left: 10px;">₹{{ item.price }}</span>
                  <div style="font-size: 13px; color: #64748b; margin-top: 5px;"><span *ngIf="item.category" style="background: #e2e8f0; padding: 2px 8px; border-radius: 12px;">{{ item.category }}</span></div>
                </div>
                <button style="color: #ef4444; background: none; border: none; cursor: pointer; font-weight: 600;" (click)="deleteRecipe(item.id || item._id)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <!-- MAPPING TAB -->
        <div *ngIf="menuTab === 'mapping'">
          <div class="settings-card">
            <div class="card-header-styled">
              <div class="icon-circle">🔗</div>
              <div><h3>Map Items to Categories</h3></div>
            </div>
            <div style="padding: 20px; display: flex; gap: 20px;">
              
              <!-- Category Selector -->
              <div style="flex: 1;">
                <h4 style="margin-top: 0;">Select Category</h4>
                <select [(ngModel)]="selectedMappingCategory" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px; margin-bottom: 20px;">
                  <option value="">-- Choose Category --</option>
                  <option *ngFor="let cat of categories" [value]="cat.name">{{ cat.name }}</option>
                </select>

                <div *ngIf="selectedMappingCategory">
                  <h4>Items currently in "{{ selectedMappingCategory }}"</h4>
                  <div *ngFor="let item of recipes" style="margin-bottom: 5px;">
                    <div *ngIf="item.category === selectedMappingCategory" style="display: flex; justify-content: space-between; background: #ecfdf5; padding: 10px; border-radius: 8px; border: 1px solid #a7f3d0;">
                      <span>{{ item.title }}</span>
                      <button style="color: #ef4444; background: none; border: none; cursor: pointer;" (click)="updateRecipeCategory(item.id || item._id, '')">Remove</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Unmapped Items -->
              <div style="flex: 1; border-left: 1px solid #e2e8f0; padding-left: 20px;" *ngIf="selectedMappingCategory">
                <h4 style="margin-top: 0;">Other Items (Click to add)</h4>
                <div style="max-height: 400px; overflow-y: auto;">
                  <div *ngFor="let item of recipes">
                    <div *ngIf="item.category !== selectedMappingCategory" style="display: flex; justify-content: space-between; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 5px;">
                      <span>{{ item.title }} <small style="color: #94a3b8;">({{ item.category || 'Unmapped' }})</small></span>
                      <button style="color: #3b82f6; background: none; border: none; cursor: pointer; font-weight: bold;" (click)="updateRecipeCategory(item.id || item._id, selectedMappingCategory)">Add</button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </ng-container>
`;

content = content.replace(/<\/ng-container>\n\n    <!-- SETTINGS VIEW -->/, menuHtml + `\n\n    <!-- SETTINGS VIEW -->`);

fs.writeFileSync(path, content);

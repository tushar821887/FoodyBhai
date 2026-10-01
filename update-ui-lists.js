const fs = require('fs');
const path = 'admin-app/src/app/pages/orders/orders.page.html';
let content = fs.readFileSync(path, 'utf8');

// Replace Categories List
const oldCategories = `<div \\*ngFor="let cat of categories" style="display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #e2e8f0;">\\s*<strong>{{ cat\\.name }}<\\/strong>\\s*<button style="color: #ef4444; background: none; border: none; cursor: pointer; font-weight: 600;" \\(click\\)="deleteCategory\\(cat\\.id\\)">Delete<\\/button>\\s*<\\/div>`;
const newCategories = `<div *ngFor="let cat of categories" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #e2e8f0;">
                <div *ngIf="editingCategory?.id !== cat.id">
                  <strong>{{ cat.name }}</strong>
                </div>
                <div *ngIf="editingCategory?.id === cat.id" style="flex: 1; display: flex; gap: 10px; margin-right: 15px;">
                  <input type="text" [(ngModel)]="editingCategory.name" class="input-with-icon" style="padding: 8px; border: 2px solid #e2e8f0; border-radius: 8px; flex: 1;">
                </div>
                
                <div *ngIf="editingCategory?.id !== cat.id">
                  <button style="color: #3b82f6; background: none; border: none; cursor: pointer; font-weight: 600; margin-right: 15px;" (click)="editCategory(cat)">Edit</button>
                  <button style="color: #ef4444; background: none; border: none; cursor: pointer; font-weight: 600;" (click)="deleteCategory(cat.id)">Delete</button>
                </div>
                <div *ngIf="editingCategory?.id === cat.id">
                  <button style="color: #10b981; background: none; border: none; cursor: pointer; font-weight: 600; margin-right: 15px;" (click)="saveCategoryEdit()">Save</button>
                  <button style="color: #64748b; background: none; border: none; cursor: pointer; font-weight: 600;" (click)="editingCategory = null">Cancel</button>
                </div>
              </div>`;
content = content.replace(new RegExp(oldCategories, 'g'), newCategories);

// Replace Recipes List
const oldRecipes = `<div \\*ngFor="let item of recipes" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #e2e8f0;">\\s*<div>\\s*<strong style="font-size: 16px;">{{ item\\.title }}<\\/strong> <span style="color: #10b981; font-weight: bold; margin-left: 10px;">₹{{ item\\.price }}<\\/span>\\s*<div style="font-size: 13px; color: #64748b; margin-top: 5px;"><span \\*ngIf="item\\.category" style="background: #e2e8f0; padding: 2px 8px; border-radius: 12px;">{{ item\\.category }}<\\/span><\\/div>\\s*<\\/div>\\s*<button style="color: #ef4444; background: none; border: none; cursor: pointer; font-weight: 600;" \\(click\\)="deleteRecipe\\(item\\.id \\|\\| item\\._id\\)">Delete<\\/button>\\s*<\\/div>`;

const newRecipes = `<div *ngFor="let item of recipes" class="recipe-list-item" style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #e2e8f0; gap: 15px;">
                <img [src]="item.image || 'https://via.placeholder.com/60'" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <strong style="font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ item.title }}</strong>
                    <span *ngIf="item.isVeg" style="color: #10b981; font-size: 10px; border: 1px solid #10b981; padding: 2px 4px; border-radius: 4px; font-weight: bold;">VEG</span>
                    <span *ngIf="!item.isVeg" style="color: #ef4444; font-size: 10px; border: 1px solid #ef4444; padding: 2px 4px; border-radius: 4px; font-weight: bold;">NON-VEG</span>
                  </div>
                  <div style="font-size: 13px; color: #64748b; margin-top: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ item.description || 'No description provided.' }}</div>
                  <div style="font-size: 12px; margin-top: 8px;"><span *ngIf="item.category" style="background: #f1f5f9; color: #475569; font-weight: 600; padding: 4px 8px; border-radius: 6px;">{{ item.category }}</span></div>
                </div>
                <div style="text-align: right; margin-right: 15px;">
                  <span style="color: #10b981; font-weight: 800; font-size: 18px;">₹{{ item.price }}</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <button style="color: #3b82f6; background: #eff6ff; border: none; cursor: pointer; font-weight: 600; padding: 6px 12px; border-radius: 6px;" (click)="editRecipe(item)">Edit</button>
                  <button style="color: #ef4444; background: #fef2f2; border: none; cursor: pointer; font-weight: 600; padding: 6px 12px; border-radius: 6px;" (click)="deleteRecipe(item.id || item._id)">Delete</button>
                </div>
              </div>`;

content = content.replace(new RegExp(oldRecipes, 'g'), newRecipes);

// Add Edit Recipe Modal
const editRecipeModal = `
<!-- Edit Recipe Modal -->
<div class="modal-overlay" *ngIf="showEditRecipeModal">
  <div class="modal-content assign-modal" style="max-width: 500px;">
    <div class="modal-header">
      <div class="modal-icon-wrapper" style="background: #eff6ff; color: #3b82f6;">
        <span class="modal-icon">✏️</span>
      </div>
      <h3>Edit Menu Item</h3>
    </div>
    
    <div class="settings-form-modern" style="padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;" *ngIf="editingRecipe">
      <input type="text" [(ngModel)]="editingRecipe.title" placeholder="Item Name" class="input-with-icon" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">
      <input type="number" [(ngModel)]="editingRecipe.price" placeholder="Price (₹)" class="input-with-icon" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">
      <input type="text" [(ngModel)]="editingRecipe.description" placeholder="Short Description" class="input-with-icon" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">
      <input type="text" [(ngModel)]="editingRecipe.image" placeholder="Image URL" class="input-with-icon" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">
      <select [(ngModel)]="editingRecipe.category" class="input-with-icon" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">
        <option value="">Select Category</option>
        <option *ngFor="let cat of categories" [value]="cat.name">{{ cat.name }}</option>
      </select>
      <label style="display: flex; align-items: center; gap: 10px; font-weight: 600;">
        <input type="checkbox" [(ngModel)]="editingRecipe.isVeg" style="width: 20px; height: 20px;"> Vegetarian?
      </label>
    </div>

    <div class="modal-actions full-width">
      <button class="btn-cancel-modal" (click)="showEditRecipeModal = false">Cancel</button>
      <button class="btn-dispatch-modal" style="background: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);" (click)="saveRecipeEdit()">
        Save Changes
      </button>
    </div>
  </div>
</div>
`;

content = content + editRecipeModal;

fs.writeFileSync(path, content);

const fs = require('fs');
const path = 'admin-app/src/app/pages/orders/orders.page.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/selectedMappingCategory = '';/, `selectedMappingCategory = '';
  
  // Edit State
  editingCategory: any = null;
  
  editingRecipe: any = null;
  showEditRecipeModal = false;`);

content = content.replace(/deleteCategory\(id: string\) \{/, `editCategory(cat: any) {
    this.editingCategory = { ...cat };
  }

  saveCategoryEdit() {
    if(!this.editingCategory) return;
    this.api.updateCategory(this.editingCategory.id, this.editingCategory.name, this.editingCategory.description).subscribe(() => {
      this.editingCategory = null;
      this.fetchCategories();
    });
  }

  deleteCategory(id: string) {`);

content = content.replace(/deleteRecipe\(id: string\) \{/, `editRecipe(recipe: any) {
    this.editingRecipe = { ...recipe };
    this.showEditRecipeModal = true;
  }

  saveRecipeEdit() {
    if(!this.editingRecipe) return;
    this.api.updateRecipe(this.editingRecipe.id || this.editingRecipe._id, this.editingRecipe).subscribe(() => {
      this.showEditRecipeModal = false;
      this.editingRecipe = null;
      this.fetchRecipes();
    });
  }

  deleteRecipe(id: string) {`);

fs.writeFileSync(path, content);

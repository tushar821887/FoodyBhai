const fs = require('fs');
const path = 'admin-app/src/app/pages/orders/orders.page.ts';
let content = fs.readFileSync(path, 'utf8');

// View state
content = content.replace(/currentView: 'dashboard' \| 'agents' \| 'settings' = 'dashboard';/, `currentView: 'dashboard' | 'agents' | 'settings' | 'menu' = 'dashboard';
  menuTab: 'categories' | 'items' | 'mapping' = 'categories';
  
  categories: any[] = [];
  recipes: any[] = [];
  
  // Menu Category Form
  newCategoryName = '';
  newCategoryDesc = '';
  
  // Menu Item Form
  newItem = {
    title: '',
    slug: '',
    price: 0,
    category: '',
    description: '',
    image: '',
    isVeg: true
  };
  
  // Mapping
  selectedMappingCategory = '';
  `);

content = content.replace(/setView\(view: 'dashboard' \| 'agents' \| 'settings'\) \{/, `setView(view: 'dashboard' | 'agents' | 'settings' | 'menu') {`);

content = content.replace(/if \(view === 'settings'\) \{/, `if (view === 'menu') {
      this.fetchCategories();
      this.fetchRecipes();
    }
    if (view === 'settings') {`);

// Add methods
content = content.replace(/saveSettings\(\) \{/, `
  setMenuTab(tab: 'categories' | 'items' | 'mapping') {
    this.menuTab = tab;
  }

  fetchCategories() {
    this.api.getCategories().subscribe(res => this.categories = res);
  }

  addCategory() {
    if(!this.newCategoryName) return;
    this.api.addCategory(this.newCategoryName, this.newCategoryDesc).subscribe(() => {
      this.newCategoryName = '';
      this.newCategoryDesc = '';
      this.fetchCategories();
    });
  }

  deleteCategory(id: string) {
    if(confirm('Delete this category?')) {
      this.api.deleteCategory(id).subscribe(() => this.fetchCategories());
    }
  }

  fetchRecipes() {
    this.api.getRecipes().subscribe(res => this.recipes = res);
  }

  addRecipe() {
    if(!this.newItem.title || !this.newItem.price) return;
    this.newItem.slug = this.newItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    this.api.addRecipe(this.newItem).subscribe(() => {
      this.newItem = { title: '', slug: '', price: 0, category: '', description: '', image: '', isVeg: true };
      this.fetchRecipes();
      alert('Item added successfully');
    });
  }

  deleteRecipe(id: string) {
    if(confirm('Delete this item?')) {
      this.api.deleteRecipe(id).subscribe(() => this.fetchRecipes());
    }
  }

  updateRecipeCategory(recipeId: string, newCategory: string) {
    this.api.updateRecipe(recipeId, { category: newCategory }).subscribe(() => {
      this.fetchRecipes();
    });
  }

  saveSettings() {`);

fs.writeFileSync(path, content);

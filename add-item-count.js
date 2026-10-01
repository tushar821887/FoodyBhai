const fs = require('fs');
const path = 'admin-app/src/app/pages/orders/orders.page.ts';
let content = fs.readFileSync(path, 'utf8');

// Insert getItemCount before deleteCategory
content = content.replace(/deleteCategory\(id: string\) \{/, `getItemCount(categoryName: string): number {
    return this.recipes.filter(r => r.category === categoryName).length;
  }

  deleteCategory(id: string) {`);

fs.writeFileSync(path, content);

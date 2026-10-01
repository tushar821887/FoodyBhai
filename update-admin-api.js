const fs = require('fs');
const path = 'admin-app/src/app/services/api.service.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/deleteAgent\(id: string\) \{[\s\S]*?\}\n/, `deleteAgent(id: string) {
    return this.http.delete(\`\${this.apiUrl}/agents/\${id}\`, this.getHeaders());
  }

  // Categories
  getCategories() {
    return this.http.get<any[]>(\`\${this.apiUrl}/categories\`);
  }
  addCategory(name: string, description?: string) {
    return this.http.post<any>(\`\${this.apiUrl}/categories\`, { name, description }, this.getHeaders());
  }
  deleteCategory(id: string) {
    return this.http.delete(\`\${this.apiUrl}/categories/\${id}\`, this.getHeaders());
  }

  // Recipes (Items)
  getRecipes() {
    return this.http.get<any[]>(\`\${this.apiUrl}/recipes\`);
  }
  addRecipe(data: any) {
    return this.http.post<any>(\`\${this.apiUrl}/recipes\`, data, this.getHeaders());
  }
  updateRecipe(id: string, data: any) {
    return this.http.put<any>(\`\${this.apiUrl}/recipes/\${id}\`, data, this.getHeaders());
  }
  deleteRecipe(id: string) {
    return this.http.delete(\`\${this.apiUrl}/recipes/\${id}\`, this.getHeaders());
  }
`);

fs.writeFileSync(path, content);

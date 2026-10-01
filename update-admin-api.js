const fs = require('fs');
const path = 'admin-app/src/app/services/api.service.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/deleteCategory\(id: string\) \{/, `updateCategory(id: string, name: string, description?: string) {
    return this.http.put<any>(\`\${this.apiUrl}/categories/\${id}\`, { name, description }, this.getHeaders());
  }

  deleteCategory(id: string) {`);

fs.writeFileSync(path, content);

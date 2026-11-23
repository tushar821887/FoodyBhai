const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, 'admin-app', 'src', 'app', 'services', 'api.service.ts');
let apiContent = fs.readFileSync(apiPath, 'utf8');

const newApiMethod = `  getOrders() {
    return this.http.get<Order[]>(\`\${this.apiUrl}/orders/admin/all\`, this.getHeaders());
  }

  getRestaurantStats() {
    return this.http.get<any>(\`\${this.apiUrl}/orders/restaurant/stats\`, this.getHeaders());
  }`;

apiContent = apiContent.replace("  getOrders() {\n    return this.http.get<Order[]>(`${this.apiUrl}/orders/admin/all`, this.getHeaders());\n  }", newApiMethod);
fs.writeFileSync(apiPath, apiContent);
console.log('Patched admin api.service.ts');

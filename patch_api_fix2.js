const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, 'admin-app', 'src', 'app', 'services', 'api.service.ts');
let apiContent = fs.readFileSync(apiPath, 'utf8');

const oldMethod = `  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(\`\${this.apiUrl}/orders/admin/all\`, this.getHeaders());
  }`;

const newMethod = `  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(\`\${this.apiUrl}/orders/admin/all\`, this.getHeaders());
  }

  getRestaurantStats(): Observable<any> {
    return this.http.get<any>(\`\${this.apiUrl}/orders/restaurant/stats\`, this.getHeaders());
  }`;

apiContent = apiContent.replace(oldMethod, newMethod);
fs.writeFileSync(apiPath, apiContent);
console.log('Fixed api.service.ts for real');

const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'frontend', 'src', 'app', 'services', 'order.service.ts');
let content = fs.readFileSync(servicePath, 'utf8');

const newMethod = `  rateOrder(id: string, rating: number, review: string): Observable<Order> {
    return this.http.post<Order>(\`\${this.API_URL}/orders/\${id}/rate\`, { rating, review });
  }

  getRestaurantStats(): Observable<any> {
    return this.http.get<any>(\`\${this.API_URL}/orders/restaurant/stats\`);
  }
}`;

content = content.replace(/  rateOrder[\s\S]*?\n\}/, newMethod);
fs.writeFileSync(servicePath, content);
console.log('Fixed order.service.ts');

const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'frontend', 'src', 'app', 'services', 'order.service.ts');
let content = fs.readFileSync(servicePath, 'utf8');

// Fix placeOrder signature
content = content.replace("placeOrder(orderData: { items: CartItem[], totalAmount: number, deliveryDetails: DeliveryDetails, orderType: string, paymentMethod?: string }): Observable<Order>", "placeOrder(orderData: any): Observable<Order>");

// Add rateOrder method
const newMethods = `  getOrderHistory(): Observable<Order[]> {
    return this.http.get<Order[]>(\`\${this.API_URL}/orders\`);
  }

  rateOrder(id: string, rating: number, review: string): Observable<Order> {
    return this.http.post<Order>(\`\${this.API_URL}/orders/\${id}/rate\`, { rating, review });
  }
}`;

content = content.replace(/  getOrderHistory\(\): Observable<Order\[\]> \{\s*return this\.http\.get<Order\[\]>\(`\$\{this\.API_URL\}\/orders`\);\s*\}\s*\}/, newMethods);
fs.writeFileSync(servicePath, content);
console.log('Fixed order.service.ts');

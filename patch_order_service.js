const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'frontend', 'src', 'app', 'services', 'order.service.ts');
let content = fs.readFileSync(servicePath, 'utf8');

const oldOrderInterface = `export interface Order {
  _id?: string;
  id?: string;
  userId?: string;
  items: CartItem[];
  totalAmount: number;
  deliveryDetails: DeliveryDetails;
  orderType: string;
  status: string;
  deliveryAgent?: { name: string; phone: string };
  createdAt?: string;
}`;

const newOrderInterface = `export interface Order {
  _id?: string;
  id?: string;
  userId?: string;
  items: CartItem[];
  itemTotal?: number;
  discount?: number;
  gst?: number;
  platformFee?: number;
  totalAmount: number;
  deliveryDetails: DeliveryDetails;
  orderType: string;
  status: string;
  deliveryAgent?: { name: string; phone: string };
  createdAt?: string;
  rating?: number;
  review?: string;
}`;

content = content.replace(oldOrderInterface, newOrderInterface);

// Add rateOrder method
const oldEnd = `  deleteOrder(id: string): Observable<any> {
    return this.http.delete(\`\${this.API_URL}/orders/\${id}\`, this.getHeaders());
  }
}`;

const newEnd = `  deleteOrder(id: string): Observable<any> {
    return this.http.delete(\`\${this.API_URL}/orders/\${id}\`, this.getHeaders());
  }

  rateOrder(id: string, rating: number, review: string): Observable<any> {
    return this.http.post(\`\${this.API_URL}/orders/\${id}/rate\`, { rating, review }, this.getHeaders());
  }
}`;

content = content.replace(oldEnd, newEnd);
fs.writeFileSync(servicePath, content);
console.log('Fixed order.service.ts');

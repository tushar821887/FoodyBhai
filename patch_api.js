const fs = require('fs');
let content = fs.readFileSync('admin-app/src/app/services/api.service.ts', 'utf8');

content = content.replace(
  /updateOrderStatus\(orderId: string, status: string, preparationTime\?: number, deliveryAgent\?: \{ name: string; phone: string \}\): Observable<any> \{\s*return this\.http\.put\(`\$\{this\.apiUrl\}\/orders\/admin\/\$\{orderId\}\/status`, \{ status, preparationTime, deliveryAgent \}, this\.getHeaders\(\)\);\s*\}/,
  `updateOrderStatus(orderId: string, status: string, preparationTime?: number, deliveryAgent?: { name: string; phone: string }, cancelReason?: string): Observable<any> {
    return this.http.put(\`\${this.apiUrl}/orders/admin/\${orderId}/status\`, { status, preparationTime, deliveryAgent, cancelReason }, this.getHeaders());
  }`
);

fs.writeFileSync('admin-app/src/app/services/api.service.ts', content);
console.log('patched api.service.ts');

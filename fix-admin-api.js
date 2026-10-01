const fs = require('fs');
const path = 'admin-app/src/app/services/api.service.ts';
let content = fs.readFileSync(path, 'utf8');

// Add Agent interface
content = content.replace(/export interface Order \{/, `export interface Agent {
  id: string;
  name: string;
  phone: string;
}

export interface Order {`);

// Add deliveryAgent to Order interface
content = content.replace(/paymentStatus\?: string;/, `paymentStatus?: string;
  deliveryAgent?: { name: string; phone: string };`);

// Update updateOrderStatus
content = content.replace(/updateOrderStatus\(orderId: string, status: string, preparationTime\?: number\)/, `updateOrderStatus(orderId: string, status: string, preparationTime?: number, deliveryAgent?: { name: string; phone: string })`);
content = content.replace(/return this.http.put\(\`\$\{this.apiUrl\}\/orders\/admin\/\$\{orderId\}\/status\`, \{ status, preparationTime \}/, `return this.http.put(\`\$\{this.apiUrl\}/orders/admin/\$\{orderId\}/status\`, { status, preparationTime, deliveryAgent }`);

// Add Agents CRUD
content = content.replace(/logout\(\) \{/, `getAgents() {
    return this.http.get<Agent[]>(\`\$\{this.apiUrl\}/agents\`);
  }

  addAgent(name: string, phone: string) {
    return this.http.post<Agent>(\`\$\{this.apiUrl\}/agents\`, { name, phone });
  }

  deleteAgent(id: string) {
    return this.http.delete(\`\$\{this.apiUrl\}/agents/\$\{id\}\`);
  }

  logout() {`);

fs.writeFileSync(path, content);

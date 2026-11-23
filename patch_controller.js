const fs = require('fs');
let content = fs.readFileSync('backend/src/orders/orders.controller.ts', 'utf8');

content = content.replace(
  /@Body\('deliveryAgent'\) deliveryAgent\?: \{ name: string; phone: string \}\s*\) \{\s*return this\.ordersService\.updateOrderStatus\(id, status, preparationTime, deliveryAgent\);\s*\}/,
  `@Body('deliveryAgent') deliveryAgent?: { name: string; phone: string },
    @Body('cancelReason') cancelReason?: string
  ) {
    return this.ordersService.updateOrderStatus(id, status, preparationTime, deliveryAgent, cancelReason);
  }`
);

fs.writeFileSync('backend/src/orders/orders.controller.ts', content);
console.log('orders.controller.ts patched');

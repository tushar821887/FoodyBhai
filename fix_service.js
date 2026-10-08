const fs = require('fs');
let content = fs.readFileSync('backend/src/orders/orders.service.ts', 'utf8');

content = content.replace(
  /const order = await this\.orderModel\.findByIdAndUpdate\(\s*id,\s*updateData,\s*\{ new: true \}\s*\);\s*return order;/m,
  `const order = await this.orderModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    if (!order) throw new NotFoundException('Order not found');
    return order;`
);

fs.writeFileSync('backend/src/orders/orders.service.ts', content);
console.log('fixed service');

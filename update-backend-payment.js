const fs = require('fs');
const path = 'backend/src/orders/orders.service.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/const updateData: any = \{ status \};/, `const updateData: any = { status };
    if (status === 'delivered') {
      updateData.paymentStatus = 'paid';
    }`);

fs.writeFileSync(path, content);

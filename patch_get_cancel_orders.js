const fs = require('fs');
const file = 'admin-app/src/app/pages/orders/orders.page.ts';
let code = fs.readFileSync(file, 'utf8');

const newMethod = `
  getCancelAndRefundOrders() {
    return this.baseOrders.filter(o => 
      (o.cancelRequest && o.cancelRequest.status === 'pending') || 
      (o.status === 'cancelled' && o.refundStatus === 'pending')
    ).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }
`;

if (!code.includes('getCancelAndRefundOrders()')) {
  code = code.replace(/}\s*$/, newMethod + '\n}\n');
  fs.writeFileSync(file, code);
  console.log("Method added.");
} else {
  console.log("Method already exists.");
}

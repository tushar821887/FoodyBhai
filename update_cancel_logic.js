const fs = require('fs');
const file = 'admin-app/src/app/pages/orders/orders.page.ts';
let code = fs.readFileSync(file, 'utf8');

const regex = /getCancelAndRefundOrders\(\) {[\s\S]*?}/;

const newLogic = `getCancelAndRefundOrders() {
    return this.baseOrders.filter(o => 
      (o.cancelRequest && o.cancelRequest.status === 'pending') || 
      (o.status === 'cancelled')
    ).sort((a, b) => {
      // Sort pending requests and pending refunds first
      const aNeedsAction = (a.cancelRequest?.status === 'pending') || (a.status === 'cancelled' && a.refundStatus === 'pending') ? 1 : 0;
      const bNeedsAction = (b.cancelRequest?.status === 'pending') || (b.status === 'cancelled' && b.refundStatus === 'pending') ? 1 : 0;
      if (aNeedsAction !== bNeedsAction) return bNeedsAction - aNeedsAction;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }`;

code = code.replace(regex, newLogic);
fs.writeFileSync(file, code);
console.log("Updated TS logic");

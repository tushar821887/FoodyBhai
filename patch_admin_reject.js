const fs = require('fs');
let content = fs.readFileSync('admin-app/src/app/pages/orders/orders.page.ts', 'utf8');

content = content.replace(
  /rejectOrder\(orderId: string\) \{\s*if\(confirm\('Are you sure you want to reject this order\?'\)\) \{\s*this\.api\.updateOrderStatus\(orderId, 'rejected'\)\.subscribe\(\(\) => this\.fetchOrders\(\)\);\s*\}\s*\}/,
  `adminRejectOrderId: string | null = null;
  adminRejectReason: string = '';
  showAdminRejectModal = false;

  rejectOrder(orderId: string) {
    this.adminRejectOrderId = orderId;
    this.adminRejectReason = '';
    this.showAdminRejectModal = true;
  }

  confirmAdminReject() {
    if (this.adminRejectOrderId && this.adminRejectReason.trim()) {
      this.api.updateOrderStatus(this.adminRejectOrderId, 'rejected', undefined, undefined, this.adminRejectReason.trim()).subscribe(() => {
        this.showAdminRejectModal = false;
        this.adminRejectOrderId = null;
        this.fetchOrders();
      });
    } else {
      alert('Please provide a reason for cancellation.');
    }
  }`
);

fs.writeFileSync('admin-app/src/app/pages/orders/orders.page.ts', content);
console.log('patched ts');

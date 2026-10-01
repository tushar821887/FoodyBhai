const fs = require('fs');
const path = 'admin-app/src/app/pages/orders/orders.page.ts';
let content = fs.readFileSync(path, 'utf8');

// Add state properties
content = content.replace(/isAddingAgent = false;/, `isAddingAgent = false;
  
  // Settings
  upiId: string = 'foodybhai@okaxis';
  qrImageUrl: string = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg';

  // Payment Modal
  showPaymentModal = false;
  orderToDeliver: any = null;
  selectedPaymentMethod: 'cod' | 'online' = 'cod';
  cashReceived: boolean = false;`);

// Update view logic
content = content.replace(/setView\(view: 'dashboard' \| 'agents'\) \{/, `setView(view: 'dashboard' | 'agents' | 'settings') {`);
content = content.replace(/this\.currentView = view;/, `this.currentView = view;
    if (view === 'settings') {
      const savedUpi = localStorage.getItem('foodybhai_upi');
      const savedQr = localStorage.getItem('foodybhai_qr');
      if (savedUpi) this.upiId = savedUpi;
      if (savedQr) this.qrImageUrl = savedQr;
    }`);

// Add methods
content = content.replace(/logout\(\) \{/, `
  saveSettings() {
    localStorage.setItem('foodybhai_upi', this.upiId);
    localStorage.setItem('foodybhai_qr', this.qrImageUrl);
    alert('Settings saved successfully!');
  }

  openPaymentModal(order: any) {
    this.orderToDeliver = order;
    this.selectedPaymentMethod = order.paymentMethod === 'online' ? 'online' : 'cod';
    this.cashReceived = false;
    this.showPaymentModal = true;
  }

  confirmDelivery() {
    if (!this.orderToDeliver) return;
    
    // In a real app, we'd also hit an endpoint to update paymentStatus to 'paid'
    // But our updateOrderStatus endpoint currently only accepts status, preparationTime, deliveryAgent.
    // Let's just update the status to delivered. The order is assumed paid if delivered.
    
    this.api.updateOrderStatus(this.orderToDeliver._id, 'delivered').subscribe(() => {
      this.showPaymentModal = false;
      this.fetchOrders();
    });
  }

  logout() {`);

fs.writeFileSync(path, content);

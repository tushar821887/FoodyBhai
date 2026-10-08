const fs = require('fs');
let content = fs.readFileSync('admin-app/src/app/pages/orders/orders.page.ts', 'utf8');

// 1. Add to ngOnInit
content = content.replace(
  "this.fetchOrders();",
  "this.api.getSetting('restaurant_open').subscribe(res => { if (res && res.value !== undefined) this.restaurantOpen = res.value === 'true' || res.value === true; });\n    this.fetchOrders();"
);

// 2. Add methods at the end of class before the last closing brace
const methodsToAdd = `

  toggleRestaurantStatus() {
    this.api.saveSetting('restaurant_open', this.restaurantOpen ? 'true' : 'false').subscribe();
  }

  get totalCompletedOrders() {
    return this.baseOrders.filter(o => o.status === 'delivered').length;
  }

  get totalPayoutAmount() {
    return this.baseOrders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  showAgentOrdersModal = false;
  selectedAgentOrders: any[] = [];
  selectedAgentForOrders: any = null;

  viewAgentOrders(agent: any) {
    this.selectedAgentForOrders = agent;
    this.selectedAgentOrders = this.baseOrders.filter(o => o.deliveryAgent && o.deliveryAgent.phone === agent.phone && o.status === 'delivered');
    this.showAgentOrdersModal = true;
  }

  getAgentDeliveryCount(agentPhone: string): number {
    return this.baseOrders.filter(o => o.deliveryAgent && o.deliveryAgent.phone === agentPhone && o.status === 'delivered').length;
  }
`;

content = content.replace(/}\s*$/, methodsToAdd + '\n}\n');

fs.writeFileSync('admin-app/src/app/pages/orders/orders.page.ts', content);
console.log('patched');

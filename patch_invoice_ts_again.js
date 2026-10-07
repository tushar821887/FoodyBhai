const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

const newMethod = `
  downloadInvoice(orderId: string) {
    const url = \`\${environment.apiUrl}/orders/\${orderId}/invoice\`;
    window.open(url, '_blank');
  }

  reorder(order: Order) {`;

tsContent = tsContent.replace("reorder(order: Order) {", newMethod);

fs.writeFileSync(tsPath, tsContent);

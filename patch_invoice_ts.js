const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

const newMethod = `
  downloadInvoice(orderId: string) {
    const url = \`\${environment.apiUrl}/orders/\${orderId}/invoice\`;
    window.open(url, '_blank');
  }

  reorder(order: any) {`;

tsContent = tsContent.replace("reorder(order: any) {", newMethod);

if (!tsContent.includes("import { environment }")) {
  tsContent = "import { environment } from '../../../environments/environment';\n" + tsContent;
}

fs.writeFileSync(tsPath, tsContent);

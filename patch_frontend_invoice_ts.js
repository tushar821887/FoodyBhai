const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

const newMethod = `  downloadInvoice(orderId: string) {
    const url = \`http://localhost:3000/api/orders/\${orderId}/invoice\`;
    window.open(url, '_blank');
  }

  reorder(order: any) {`;

tsContent = tsContent.replace("  reorder(order: any) {", newMethod);
// Wait, the API URL might be dynamic (environment variable or api service).
// Let's use environment API url.
const envUrl = "import { environment } from '../../../environments/environment';";
if (!tsContent.includes("environments/environment")) {
  tsContent = envUrl + '\n' + tsContent;
}
tsContent = tsContent.replace("http://localhost:3000/api", "${environment.apiUrl}");

fs.writeFileSync(tsPath, tsContent);
console.log('Fixed TS');

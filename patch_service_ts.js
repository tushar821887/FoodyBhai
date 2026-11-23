const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'backend', 'src', 'orders', 'orders.service.ts');
let serviceContent = fs.readFileSync(servicePath, 'utf8');

serviceContent = serviceContent.replace(
  "import * as PDFDocument from 'pdfkit';",
  "const PDFDocument = require('pdfkit');"
);

serviceContent = serviceContent.replace(
  "order.createdAt ?",
  "(order as any).createdAt ?"
);

serviceContent = serviceContent.replace(
  "new Date(order.createdAt).toLocaleString() :",
  "new Date((order as any).createdAt).toLocaleString() :"
);

fs.writeFileSync(servicePath, serviceContent);

const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

tsContent = tsContent.replace("showRateModal = false;", "showRateModal = false;\n  showDetailsModal = false;\n  selectedOrderDetails: any = null;");
tsContent = tsContent.replace("openRateModal(order: any) {", "openDetailsModal(order: any) {\n    this.selectedOrderDetails = order;\n    this.showDetailsModal = true;\n  }\n\n  closeDetailsModal() {\n    this.showDetailsModal = false;\n    this.selectedOrderDetails = null;\n  }\n\n  openRateModal(order: any) {");

fs.writeFileSync(tsPath, tsContent);
console.log('Fixed orders.ts');

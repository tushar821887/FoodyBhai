const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'admin-app', 'src', 'app', 'pages', 'orders', 'orders.page.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

tsContent = tsContent.replace("next: (stats) => {", "next: (stats: any) => {");
tsContent = tsContent.replace("error: (err) => console.error('Failed to fetch stats', err)", "error: (err: any) => console.error('Failed to fetch stats', err)");

fs.writeFileSync(tsPath, tsContent);
console.log('Fixed types in orders.page.ts');

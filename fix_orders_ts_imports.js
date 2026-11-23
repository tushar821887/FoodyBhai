const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.ts');
let content = fs.readFileSync(tsPath, 'utf8');

content = content.replace("imports: [CommonModule]", "imports: [CommonModule, FormsModule]");
fs.writeFileSync(tsPath, content);
console.log('Fixed forms module import');

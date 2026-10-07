const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// The inline style for buttons had min-width: 120px. We can remove it and ensure gap: 10px and flex: 1.
content = content.replace(/min-width: 120px;/g, '');

// The "order-compact-info" border bottom was very light (#f8fafc). Let's make it slightly more visible.
content = content.replace(/border-bottom: 1px solid #f8fafc;/g, 'border-bottom: 1px solid #e2e8f0;');

// Also, the background of the bottom actions area is #fdfdfd.
content = content.replace(/background: #fdfdfd;/g, 'background: #f8fafc;');

fs.writeFileSync(htmlPath, content);
console.log('Fixed button inline styles');

const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const oldOrdersList = `.orders-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 850px;
  margin: 0 auto;
}`;

const newOrdersList = `.orders-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}`;

cssContent = cssContent.replace(oldOrdersList, newOrdersList);

fs.writeFileSync(cssPath, cssContent);
console.log('Fixed orders.css layout');

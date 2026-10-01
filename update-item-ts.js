const fs = require('fs');
const path = 'admin-app/src/app/pages/orders/orders.page.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/if\(!this\.newItem\.title \|\| !this\.newItem\.price\) return;/, `if(!this.newItem.title || !this.newItem.price || !this.newItem.description) {
      alert('Please fill out Title, Price, and Description');
      return;
    }`);

fs.writeFileSync(path, content);

const fs = require('fs');
let content = fs.readFileSync('admin-app/src/app/pages/orders/orders.page.html', 'utf8');
content = content.replace(
  /<\/div>\n\n<!-- Admin Reject\/Cancel Order Modal -->/,
  '  </div>\n</div>\n\n<!-- Admin Reject/Cancel Order Modal -->'
);
fs.writeFileSync('admin-app/src/app/pages/orders/orders.page.html', content);

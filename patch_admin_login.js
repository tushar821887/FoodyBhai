const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'admin-app', 'src', 'app', 'pages', 'login', 'login.page.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "if (res.user?.role !== 'admin') {",
  "if (res.user?.role !== 'admin' && res.user?.role !== 'agent') {"
);

content = content.replace(
  "this.error = 'Access denied. Admin only.';",
  "this.error = 'Access denied. Authorized personnel only.';"
);

fs.writeFileSync(filePath, content);

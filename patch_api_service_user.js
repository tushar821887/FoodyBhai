const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'admin-app', 'src', 'app', 'services', 'api.service.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "localStorage.setItem(this.tokenKey, res.accessToken);",
  "localStorage.setItem(this.tokenKey, res.accessToken);\n            localStorage.setItem('admin_user', JSON.stringify(res.user));"
);

content = content.replace(
  "localStorage.removeItem(this.tokenKey);",
  "localStorage.removeItem(this.tokenKey);\n      localStorage.removeItem('admin_user');"
);

content = content.replace(
  "export class ApiService {",
  `export class ApiService {
  getCurrentUser() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const user = localStorage.getItem('admin_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }`
);

fs.writeFileSync(filePath, content);
console.log('Patched api service for user storage');

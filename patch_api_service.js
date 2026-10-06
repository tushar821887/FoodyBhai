const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'admin-app', 'src', 'app', 'services', 'api.service.ts');
let content = fs.readFileSync(servicePath, 'utf8');

const userMethods = `
  // Users
  getUsers() {
    return this.http.get<any[]>(\`\${this.apiUrl}/users\`, this.getHeaders());
  }
  updateUser(id: string, data: any) {
    return this.http.put<any>(\`\${this.apiUrl}/users/\${id}\`, data, this.getHeaders());
  }
  deleteUser(id: string) {
    return this.http.delete(\`\${this.apiUrl}/users/\${id}\`, this.getHeaders());
  }
`;

content = content.replace('logout()', userMethods + '\n  logout()');
fs.writeFileSync(servicePath, content);
console.log('api.service.ts updated');

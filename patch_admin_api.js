const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'admin-app/src/app/services/api.service.ts');
let content = fs.readFileSync(filePath, 'utf8');

const settingsMethods = `
  // Settings
  getSetting(key: string) {
    return this.http.get<any>(\`\${this.apiUrl}/settings/\${key}\`);
  }
  
  saveSetting(key: string, value: any) {
    return this.http.put<any>(\`\${this.apiUrl}/settings/\${key}\`, { value }, this.getHeaders());
  }
`;

content = content.replace("export class ApiService {", "export class ApiService {" + settingsMethods);
fs.writeFileSync(filePath, content);

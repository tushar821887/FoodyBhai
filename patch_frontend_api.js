const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'frontend/src/app/services/api.service.ts');
let content = fs.readFileSync(filePath, 'utf8');

const getSettingStr = `
  getSetting(key: string) {
    return this.http.get<any>(\`\${this.apiUrl}/settings/\${key}\`);
  }
`;
content = content.replace("export class ApiService {", "export class ApiService {" + getSettingStr);
fs.writeFileSync(filePath, content);

const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'frontend/src/app/services/order.service.ts');
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace("export class OrderService {", "export class OrderService {\n  getSetting(key: string): Observable<any> {\n    return this.http.get<any>(`${this.API_URL}/settings/${key}`);\n  }");
fs.writeFileSync(filePath, content);

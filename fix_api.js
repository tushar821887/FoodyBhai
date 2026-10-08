const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'admin-app', 'src', 'app', 'services', 'api.service.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "return this.http.post<Agent>(`${this.apiUrl}/agents`, { name, phone }, this.getHeaders());",
  "return this.http.post<Agent>(`${this.apiUrl}/agents`, { name, phone, email, password }, this.getHeaders());"
);

fs.writeFileSync(filePath, content);

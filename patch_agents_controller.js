const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'agents', 'agents.controller.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "create(@Body('name') name: string, @Body('phone') phone: string) {",
  "create(@Body('name') name: string, @Body('phone') phone: string, @Body('email') email?: string, @Body('password') password?: string) {"
);

content = content.replace(
  "return this.agentsService.create(name, phone);",
  "return this.agentsService.create(name, phone, email, password);"
);

fs.writeFileSync(filePath, content);
console.log('Patched agents controller');

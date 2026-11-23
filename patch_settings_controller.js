const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'backend/src/settings/settings.controller.ts');
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace("return this.settingsService.getSetting(key);", "const value = await this.settingsService.getSetting(key);\n    return { value };");
content = content.replace("getSetting(@Param('key') key: string) {", "async getSetting(@Param('key') key: string) {");
fs.writeFileSync(filePath, content);

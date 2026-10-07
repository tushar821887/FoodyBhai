const fs = require('fs');
const path = require('path');

const modulePath = path.join(__dirname, 'backend', 'src', 'auth', 'auth.module.ts');
let content = fs.readFileSync(modulePath, 'utf8');

content = content.replace(
  "import { UsersModule } from '../users/users.module';",
  "import { UsersModule } from '../users/users.module';\nimport { AgentsModule } from '../agents/agents.module';"
);

content = content.replace(
  "imports: [\n    UsersModule,",
  "imports: [\n    UsersModule,\n    AgentsModule,"
);

fs.writeFileSync(modulePath, content);
console.log('Patched auth module');

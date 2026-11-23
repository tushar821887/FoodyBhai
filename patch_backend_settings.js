const fs = require('fs');

let moduleContent = fs.readFileSync('backend/src/settings/settings.module.ts', 'utf8');
moduleContent = moduleContent.replace(
  /providers: \[SettingsService\]\s*\}/,
  'providers: [SettingsService],\n  exports: [SettingsService]\n}'
);
fs.writeFileSync('backend/src/settings/settings.module.ts', moduleContent);

let ordersModuleContent = fs.readFileSync('backend/src/orders/orders.module.ts', 'utf8');
ordersModuleContent = "import { SettingsModule } from '../settings/settings.module';\n" + ordersModuleContent;
ordersModuleContent = ordersModuleContent.replace(
  /CartModule\s*\]/,
  'CartModule,\n    SettingsModule\n  ]'
);
fs.writeFileSync('backend/src/orders/orders.module.ts', ordersModuleContent);

console.log('patched backend modules');

const fs = require('fs');
const path = 'backend/src/orders/orders.service.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/if \(preparationTime !== undefined\) \{\n      updateData.preparationTime = preparationTime;\n    \}/, `if (preparationTime !== undefined) {
      updateData.preparationTime = preparationTime;
    }
    if (deliveryAgent) {
      updateData.deliveryAgent = deliveryAgent;
    }`);
fs.writeFileSync(path, content);

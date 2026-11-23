const fs = require('fs');
let content = fs.readFileSync('backend/src/orders/orders.service.ts', 'utf8');

content = content.replace(
  /constructor\(@InjectModel\(Order\.name\) private orderModel: Model<OrderDocument>\) \{\}/,
  `constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private settingsService: SettingsService
  ) {}`
);

fs.writeFileSync('backend/src/orders/orders.service.ts', content);

const fs = require('fs');

let content = fs.readFileSync('backend/src/orders/orders.service.ts', 'utf8');

if (!content.includes('import { SettingsService }')) {
  content = content.replace(
    /import \{ Injectable, NotFoundException \} from '@nestjs\/common';/,
    "import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';\nimport { SettingsService } from '../settings/settings.service';"
  );
}

content = content.replace(
  /constructor\(\s*@InjectModel\(Order\.name\) private orderModel: Model<OrderDocument>,\s*private cartService: CartService\s*\) \{\}/,
  `constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private cartService: CartService,
    private settingsService: SettingsService
  ) {}`
);

content = content.replace(
  /async createOrder\(userId: string, orderData: any\): Promise<OrderDocument> \{/,
  `async createOrder(userId: string, orderData: any): Promise<OrderDocument> {
    const isOnline = await this.settingsService.getSetting('restaurant_open');
    if (isOnline && (isOnline.value === 'false' || isOnline.value === false)) {
      throw new BadRequestException('We are currently offline and not accepting orders.');
    }`
);

fs.writeFileSync('backend/src/orders/orders.service.ts', content);
console.log('patched orders service with offline check');

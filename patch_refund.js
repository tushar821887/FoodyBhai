const fs = require('fs');

// 1. Update orders.service.ts
let service = fs.readFileSync('backend/src/orders/orders.service.ts', 'utf8');
const refundMethod = `
  async processRefund(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { $set: { refundStatus: 'completed' } },
      { new: true }
    );
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
`;
service = service.replace('// --- Admin Methods ---', '// --- Admin Methods ---\n' + refundMethod);
fs.writeFileSync('backend/src/orders/orders.service.ts', service);

// 2. Update orders.controller.ts
let controller = fs.readFileSync('backend/src/orders/orders.controller.ts', 'utf8');
const refundRoute = `
  @UseGuards(JwtAuthGuard)
  @Put('admin/:id/refund')
  async processRefund(@Param('id') id: string) {
    return this.ordersService.processRefund(id);
  }
`;
controller = controller.replace('} // END OF CONTROLLER', refundRoute + '\n}'); // wait, the file ends with }
controller = controller.replace(/}\s*$/, refundRoute + '\n}\n');
fs.writeFileSync('backend/src/orders/orders.controller.ts', controller);

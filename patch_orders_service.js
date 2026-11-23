const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'backend', 'src', 'orders', 'orders.service.ts');
let content = fs.readFileSync(servicePath, 'utf8');

const newMethod = `  async rateOrder(orderId: string, rating: number, review?: string): Promise<OrderDocument> {
    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      { $set: { rating, review } },
      { new: true }
    );
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
}
`;

content = content.replace("}\n", newMethod);
fs.writeFileSync(servicePath, content);
console.log('Fixed orders.service.ts');

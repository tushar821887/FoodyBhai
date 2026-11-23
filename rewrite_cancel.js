const fs = require('fs');
const file = 'backend/src/orders/orders.service.ts';
let code = fs.readFileSync(file, 'utf8');

const regex = /async cancelOrderCustomer\([\s\S]*?\n  async processRefund/m;

const newFunc = `async cancelOrderCustomer(orderId: string, reason: string): Promise<OrderDocument> {
    const existingOrder = await this.orderModel.findById(orderId);
    if (!existingOrder) throw new NotFoundException('Order not found');

    const orderDate = new Date(existingOrder.createdAt || Date.now()).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - orderDate) / (1000 * 60);

    if (diffMinutes > 1) {
      throw new BadRequestException('Cannot cancel order after 1 minute. Please contact support.');
    }

    // Always create a cancellation request instead of cancelling immediately
    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          cancelRequest: {
            requested: true,
            reason: reason || 'Customer requested cancellation',
            status: 'pending',
            requestedBy: 'Customer'
          }
        }
      },
      { new: true }
    ).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async processRefund`;

code = code.replace(regex, newFunc);
fs.writeFileSync(file, code);
console.log("Rewrote cancelOrderCustomer");

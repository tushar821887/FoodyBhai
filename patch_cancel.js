const fs = require('fs');
const file = 'backend/src/orders/orders.service.ts';
let code = fs.readFileSync(file, 'utf8');

const oldCancelLogic = `    if (existingOrder.status === 'pending') {
      // If it's just pending, cancel immediately
      const order = await this.orderModel.findByIdAndUpdate(
        orderId,
        {
          $set: {
            status: 'cancelled',
            cancellationDetails: { cancelledBy: 'Customer', reason: reason || 'Cancelled by customer' },
            refundStatus: existingOrder.paymentMethod === 'online' ? 'pending' : 'none'
          }
        },
        { new: true }
      ).exec();
      return order;
    }

    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          cancelRequest: {
            requested: true,
            reason: reason || 'Cancelled by customer',
            status: 'pending',
            requestedBy: 'Customer'
          }
        }
      },
      { new: true }
    ).exec();
    return order;`;

const newCancelLogic = `    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          cancelRequest: {
            requested: true,
            reason: reason || 'Cancelled by customer',
            status: 'pending',
            requestedBy: 'Customer'
          }
        }
      },
      { new: true }
    ).exec();
    return order;`;

code = code.replace(oldCancelLogic, newCancelLogic);
fs.writeFileSync(file, code);
console.log("Patched cancelOrderCustomer");

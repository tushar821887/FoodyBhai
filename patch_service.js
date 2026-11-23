const fs = require('fs');
let content = fs.readFileSync('backend/src/orders/orders.service.ts', 'utf8');

// Update updateOrderStatus signature and logic
content = content.replace(
  /async updateOrderStatus\(orderId: string, status: string, preparationTime\?: number, deliveryAgent\?: \{ name: string; phone: string \}\): Promise<OrderDocument> \{/,
  `async updateOrderStatus(orderId: string, status: string, preparationTime?: number, deliveryAgent?: { name: string; phone: string }, cancelReason?: string): Promise<OrderDocument> {`
);

content = content.replace(
  /if \(status === 'cancelled' \|\| status === 'rejected'\) \{\s*updateData\.cancellationDetails = \{ cancelledBy: 'Restaurant' \};\s*\}/,
  `if (status === 'cancelled' || status === 'rejected') {
      updateData.cancellationDetails = { cancelledBy: 'Restaurant' };
      if (cancelReason) updateData.cancellationDetails.reason = cancelReason;
    }`
);

// Update resolveCancelRequest
content = content.replace(
  /async resolveCancelRequest\(id: string, approve: boolean\): Promise<OrderDocument> \{\s*const updateData: any = \{\s*\$set: \{\s*'cancelRequest\.status': approve \? 'approved' : 'rejected'\s*\}\s*\};\s*if \(approve\) \{\s*updateData\.\$set\.status = 'cancelled';\s*updateData\.\$set\.cancellationDetails = \{ cancelledBy: 'Delivery Agent' \};\s*\}\s*const order = await this\.orderModel\.findByIdAndUpdate\(\s*id,\s*updateData,\s*\{ new: true \}\s*\);\s*if \(\!order\) throw new NotFoundException\('Order not found'\);\s*return order;\s*\}/,
  `async resolveCancelRequest(id: string, approve: boolean): Promise<OrderDocument> {
    const existingOrder = await this.orderModel.findById(id);
    if (!existingOrder) throw new NotFoundException('Order not found');
    const updateData: any = {
      $set: {
        'cancelRequest.status': approve ? 'approved' : 'rejected'
      }
    };
    if (approve) {
      updateData.$set.status = 'cancelled';
      updateData.$set.cancellationDetails = { cancelledBy: 'Delivery Agent', reason: existingOrder.cancelRequest?.reason };
    }
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    return order;
  }`
);

fs.writeFileSync('backend/src/orders/orders.service.ts', content);
console.log('orders.service.ts patched');

import * as PDFDocument from 'pdfkit';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>) {}

  async createOrder(userId: string, orderData: any): Promise<OrderDocument> {
    const order = new this.orderModel({
      userId,
      ...orderData
    });
    return order.save();
  }

  async getUserOrders(userId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  // --- Admin Methods ---

  async getAllOrders(): Promise<OrderDocument[]> {
    // Sort by newest first
    return this.orderModel.find().populate('userId', 'name email phone').sort({ createdAt: -1 }).exec();
  }

  async updateOrderStatus(orderId: string, status: string, preparationTime?: number, deliveryAgent?: { name: string; phone: string }): Promise<OrderDocument> {
    const updateData: any = { status };
    if (status === 'delivered') {
      updateData.paymentStatus = 'paid';
    }
    if (preparationTime !== undefined) {
      updateData.preparationTime = preparationTime;
    }
    if (deliveryAgent) {
      updateData.deliveryAgent = deliveryAgent;
    }

    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true }
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async rateOrder(orderId: string, rating: number, review?: string): Promise<OrderDocument> {
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
  async getRestaurantStats() {
    const ordersWithRatings = await this.orderModel.find({ rating: { $exists: true, $ne: null } }).exec();
    const totalRatings = ordersWithRatings.length;
    const avgRating = totalRatings > 0 
      ? (ordersWithRatings.reduce((sum, order) => sum + (order.rating || 0), 0) / totalRatings).toFixed(1)
      : 0;
      
    return {
      averageRating: parseFloat(avgRating as string),
      totalReviews: totalRatings
    };
  }

  async generateInvoice(id: string): Promise<any> {
    const order = await this.orderModel.findById(id).populate('items.recipe').exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const doc = new PDFDocument({ margin: 50 });
    
    // Header
    doc.fontSize(20).text('FOODY BHAI', { align: 'center' });
    doc.fontSize(10).text('127, Bhatwara, Meerut - 250002', { align: 'center' });
    doc.text('+91 8218870579 | support@foodybhai.com', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Order Info
    doc.fontSize(14).text('TAX INVOICE', { align: 'center' }).moveDown();
    doc.fontSize(10);
    doc.text(`Order ID: ${order._id.toString().slice(-6).toUpperCase()}`);
    doc.text(`Date: ${order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString()}`);
    doc.text(`Status: ${order.status.toUpperCase()}`);
    doc.moveDown();

    // Customer Info
    doc.text('Billed To:');
    doc.text(order.deliveryDetails.name);
    doc.text(order.deliveryDetails.phone);
    doc.text(order.deliveryDetails.address);
    doc.moveDown();

    // Items Table Header
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    const tableTop = doc.y;
    doc.text('Item', 50, tableTop, { width: 250 });
    doc.text('Qty', 300, tableTop, { width: 50, align: 'center' });
    doc.text('Price', 350, tableTop, { width: 100, align: 'right' });
    doc.text('Total', 450, tableTop, { width: 100, align: 'right' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Items
    let subtotal = 0;
    order.items.forEach(item => {
      const y = doc.y;
      const title = item.recipe ? (item.recipe as any).title : 'Unknown Item';
      const price = item.recipe ? (item.recipe as any).price : 0;
      const qty = item.quantity;
      const total = price * qty;
      subtotal += total;

      doc.text(title, 50, y, { width: 250 });
      doc.text(qty.toString(), 300, y, { width: 50, align: 'center' });
      doc.text(`Rs. ${price}`, 350, y, { width: 100, align: 'right' });
      doc.text(`Rs. ${total}`, 450, y, { width: 100, align: 'right' });
      doc.moveDown();
    });

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Summary
    const gst = order.gst || (subtotal * 0.05);
    const platformFee = order.platformFee || 5;
    const finalTotal = subtotal + gst + platformFee;

    doc.text(`Subtotal:`, 350, doc.y, { width: 100, align: 'right' });
    doc.text(`Rs. ${subtotal.toFixed(2)}`, 450, doc.y, { width: 100, align: 'right' }).moveDown(0.5);
    
    doc.text(`GST (5%):`, 350, doc.y, { width: 100, align: 'right' });
    doc.text(`Rs. ${gst.toFixed(2)}`, 450, doc.y, { width: 100, align: 'right' }).moveDown(0.5);
    
    doc.text(`Platform Fee:`, 350, doc.y, { width: 100, align: 'right' });
    doc.text(`Rs. ${platformFee.toFixed(2)}`, 450, doc.y, { width: 100, align: 'right' }).moveDown(0.5);

    doc.moveTo(350, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(`Total Amount:`, 350, doc.y, { width: 100, align: 'right' });
    doc.text(`Rs. ${finalTotal.toFixed(2)}`, 450, doc.y, { width: 100, align: 'right' });
    doc.font('Helvetica');

    doc.moveDown(3);
    doc.fontSize(10).text('Thank you for ordering from Foody Bhai!', { align: 'center', color: 'grey' });

    doc.end();
    return doc;
  }

}
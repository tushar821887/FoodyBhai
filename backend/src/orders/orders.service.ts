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
}
import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  // 1. Create Coupon
  async create(createDto: any): Promise<CouponDocument> {
    if (!createDto.code || !createDto.code.trim()) {
      throw new BadRequestException('Coupon code is required');
    }

    const code = createDto.code.trim().toUpperCase();
    const existing = await this.couponModel.findOne({ code }).exec();
    if (existing) {
      throw new ConflictException(`Coupon with code "${code}" already exists.`);
    }

    const newCoupon = new this.couponModel({
      ...createDto,
      code,
      discountValue: Number(createDto.discountValue) || 0,
      minOrderAmount: Number(createDto.minOrderAmount) || 0,
      maxDiscount: Number(createDto.maxDiscount) || 0,
      usageLimit: Number(createDto.usageLimit) || 0,
      perUserLimit: Number(createDto.perUserLimit) || 1,
      isActive: createDto.isActive !== undefined ? Boolean(createDto.isActive) : true,
      isPublic: createDto.isPublic !== undefined ? Boolean(createDto.isPublic) : true,
    });

    return newCoupon.save();
  }

  // 2. Find All Coupons with aggregated performance metrics
  async findAll(): Promise<any[]> {
    const coupons = await this.couponModel.find().sort({ createdAt: -1 }).lean().exec();

    const statsMap = new Map<string, any>();
    try {
      // Aggregate order data grouped by couponCode
      const ordersAgg = await this.orderModel.aggregate([
        { $match: { couponCode: { $type: 'string', $ne: '' } } },
        {
          $group: {
            _id: { $toUpper: '$couponCode' },
            ordersCount: { $sum: 1 },
            completedOrdersCount: {
              $sum: { $cond: [{ $in: ['$status', ['delivered', 'preparing', 'ready', 'out_for_delivery']] }, 1, 0] }
            },
            totalRevenue: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['rejected', 'cancelled']] },
                  0,
                  { $ifNull: ['$totalAmount', 0] }
                ]
              }
            },
            totalDiscount: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['rejected', 'cancelled']] },
                  0,
                  { $ifNull: ['$discount', { $ifNull: ['$couponDiscount', 0] }] }
                ]
              }
            },
            uniqueUsers: { $addToSet: '$deliveryDetails.phone' }
          }
        }
      ]);

      for (const stat of ordersAgg) {
        if (stat._id) {
          statsMap.set(stat._id.toString().toUpperCase(), {
            ordersCount: stat.ordersCount || 0,
            completedOrdersCount: stat.completedOrdersCount || 0,
            totalRevenue: Math.round(stat.totalRevenue || 0),
            totalDiscount: Math.round(stat.totalDiscount || 0),
            uniqueCustomersCount: (stat.uniqueUsers || []).filter(Boolean).length
          });
        }
      }
    } catch (err) {
      console.error('Failed to aggregate coupon order metrics:', err);
    }

    return coupons.map(c => {
      const perf = statsMap.get(c.code.toUpperCase()) || {
        ordersCount: 0,
        completedOrdersCount: 0,
        totalRevenue: 0,
        totalDiscount: 0,
        uniqueCustomersCount: 0
      };
      return {
        ...c,
        metrics: perf
      };
    });
  }

  // 3. Overall Coupon Statistics
  async getStats(): Promise<any> {
    const totalCoupons = await this.couponModel.countDocuments().exec();
    const activeCoupons = await this.couponModel.countDocuments({ isActive: true }).exec();

    let stats: any = {
      totalOrdersWithCoupons: 0,
      completedOrdersCount: 0,
      totalCouponRevenue: 0,
      totalDiscountGranted: 0,
      uniqueCustomers: []
    };

    try {
      // Aggregate overall coupon tracking from Orders
      const overallAgg = await this.orderModel.aggregate([
        { $match: { couponCode: { $type: 'string', $ne: '' } } },
        {
          $group: {
            _id: null,
            totalOrdersWithCoupons: { $sum: 1 },
            completedOrdersCount: {
              $sum: { $cond: [{ $in: ['$status', ['delivered', 'preparing', 'ready', 'out_for_delivery']] }, 1, 0] }
            },
            totalCouponRevenue: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['rejected', 'cancelled']] },
                  0,
                  { $ifNull: ['$totalAmount', 0] }
                ]
              }
            },
            totalDiscountGranted: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['rejected', 'cancelled']] },
                  0,
                  { $ifNull: ['$discount', { $ifNull: ['$couponDiscount', 0] }] }
                ]
              }
            },
            uniqueCustomers: { $addToSet: '$deliveryDetails.phone' }
          }
        }
      ]);

      if (overallAgg && overallAgg.length > 0) {
        stats = overallAgg[0];
      }
    } catch (err) {
      console.error('Failed to aggregate overall coupon stats:', err);
    }

    return {
      totalCoupons,
      activeCoupons,
      totalOrdersWithCoupons: stats.totalOrdersWithCoupons || 0,
      completedOrdersCount: stats.completedOrdersCount || 0,
      totalCouponRevenue: Math.round(stats.totalCouponRevenue || 0),
      totalDiscountGranted: Math.round(stats.totalDiscountGranted || 0),
      uniqueCustomersCount: (stats.uniqueCustomers || []).filter(Boolean).length
    };
  }

  // 4. Tracking: Detailed orders placed with coupons, with full customer & revenue details
  async getCouponOrders(code?: string): Promise<any[]> {
    const query: any = { couponCode: { $type: 'string', $ne: '' } };
    if (code && code.trim()) {
      query.couponCode = new RegExp('^' + code.trim() + '$', 'i');
    }

    const orders = await this.orderModel
      .find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return orders.map((o: any) => {
      const user = o.userId || {};
      const del = o.deliveryDetails || {};
      return {
        _id: o._id,
        orderId: o._id.toString(),
        shortId: o._id.toString().slice(-6).toUpperCase(),
        createdAt: o.createdAt,
        status: o.status,
        orderType: o.orderType || 'delivery',
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        couponCode: o.couponCode,
        discount: o.discount || o.couponDiscount || 0,
        itemTotal: o.itemTotal || 0,
        totalAmount: o.totalAmount || 0,
        itemsCount: (o.items || []).length,
        itemsSummary: (o.items || []).map((i: any) => `${i.recipe?.title || 'Item'} (x${i.quantity})`).join(', '),
        customer: {
          name: del.name || user.name || 'Guest User',
          phone: del.phone || user.phone || 'N/A',
          email: del.email || user.email || 'N/A',
          address: del.address || 'N/A'
        }
      };
    });
  }

  // 5. Customer Coupon Validation (Called before checkout)
  async validateCoupon(code: string, orderAmount: number, userId?: string): Promise<any> {
    if (!code || !code.trim()) {
      throw new BadRequestException('Please enter a coupon code.');
    }

    const trimmedCode = code.trim().toUpperCase();
    const coupon = await this.couponModel.findOne({ code: trimmedCode }).exec();

    if (!coupon) {
      return {
        valid: false,
        message: `Coupon "${trimmedCode}" is invalid.`
      };
    }

    if (!coupon.isActive) {
      return {
        valid: false,
        message: `Coupon "${trimmedCode}" is currently inactive.`
      };
    }

    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return {
        valid: false,
        message: `Coupon "${trimmedCode}" is not valid yet.`
      };
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return {
        valid: false,
        message: `Coupon "${trimmedCode}" has expired.`
      };
    }

    const amt = Number(orderAmount) || 0;
    if (coupon.minOrderAmount && amt < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for coupon "${trimmedCode}".`
      };
    }

    if (coupon.usageLimit && coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return {
        valid: false,
        message: `Coupon "${trimmedCode}" has reached its maximum usage limit.`
      };
    }

    // Check per-user limit if user is logged in
    if (userId && coupon.perUserLimit && coupon.perUserLimit > 0) {
      try {
        const userOrdersCount = await this.orderModel.countDocuments({
          userId: new Types.ObjectId(userId),
          couponCode: trimmedCode,
          status: { $nin: ['cancelled', 'rejected'] }
        }).exec();

        if (userOrdersCount >= coupon.perUserLimit) {
          return {
            valid: false,
            message: `You have already used coupon "${trimmedCode}" the maximum number of times allowed (${coupon.perUserLimit}).`
          };
        }
      } catch (e) {}
    }

    // Calculate discount amount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (amt * (coupon.discountValue || 0)) / 100;
      if (coupon.maxDiscount && coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      // Flat fixed amount discount
      discount = Math.min(coupon.discountValue || 0, amt);
    }

    discount = Math.round(discount);
    const finalAmount = Math.max(0, amt - discount);

    return {
      valid: true,
      message: `Coupon "${coupon.code}" applied! You save ₹${discount}`,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
        discountAmount: discount
      },
      discount,
      finalAmount
    };
  }

  // 6. Active Public Coupons for Banner / Suggestions
  async getActivePublicCoupons(): Promise<any[]> {
    const now = new Date();
    return this.couponModel
      .find({
        isActive: true,
        isPublic: { $ne: false },
        $or: [{ validUntil: { $exists: false } }, { validUntil: null }, { validUntil: { $gte: now } }]
      })
      .select('code description discountType discountValue minOrderAmount maxDiscount validUntil isPublic')
      .sort({ discountValue: -1 })
      .lean()
      .exec();
  }

  // 7. Update Coupon
  async update(id: string, updateDto: any): Promise<CouponDocument> {
    const existing = await this.couponModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Coupon not found');
    }

    if (updateDto.code && updateDto.code.trim()) {
      const code = updateDto.code.trim().toUpperCase();
      const duplicate = await this.couponModel.findOne({ code, _id: { $ne: id } }).exec();
      if (duplicate) {
        throw new ConflictException(`Another coupon with code "${code}" already exists.`);
      }
      updateDto.code = code;
    }

    if (updateDto.discountValue !== undefined) updateDto.discountValue = Number(updateDto.discountValue);
    if (updateDto.minOrderAmount !== undefined) updateDto.minOrderAmount = Number(updateDto.minOrderAmount);
    if (updateDto.maxDiscount !== undefined) updateDto.maxDiscount = Number(updateDto.maxDiscount);
    if (updateDto.usageLimit !== undefined) updateDto.usageLimit = Number(updateDto.usageLimit);
    if (updateDto.perUserLimit !== undefined) updateDto.perUserLimit = Number(updateDto.perUserLimit);
    if (updateDto.isActive !== undefined) updateDto.isActive = Boolean(updateDto.isActive);
    if (updateDto.isPublic !== undefined) updateDto.isPublic = Boolean(updateDto.isPublic);

    const updated = await this.couponModel.findByIdAndUpdate(id, { $set: updateDto }, { new: true }).exec();
    return updated!;
  }

  // 8. Delete Coupon
  async remove(id: string): Promise<any> {
    const res = await this.couponModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException('Coupon not found');
    }
    return { success: true, message: `Coupon "${res.code}" deleted successfully.` };
  }

  // 9. Increment Coupon usage count when an order is created
  async recordUsage(code: string): Promise<void> {
    if (!code) return;
    try {
      await this.couponModel.findOneAndUpdate(
        { code: code.trim().toUpperCase() },
        { $inc: { usedCount: 1 } }
      ).exec();
    } catch (e) {
      // Non-blocking log
      console.error('Failed to increment coupon usage count for:', code, e);
    }
  }
}

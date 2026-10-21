const PDFDocument = require('pdfkit');
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { SettingsService } from '../settings/settings.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Recipe, RecipeDocument } from '../recipes/schemas/recipe.schema';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private orderEvents$ = new Subject<{ type: string; data: any }>();

  getOrderEvents(): Observable<{ type: string; data: any }> {
    return this.orderEvents$.asObservable();
  }

  emitOrderEvent(type: string, data: any) {
    try {
      this.orderEvents$.next({ type, data });
    } catch (err) {
      console.error('Failed to emit order event:', err);
    }
  }

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>,
    private settingsService: SettingsService,
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  async createOrder(userId: string | undefined, orderData: any): Promise<any> {
    const isOnline = await this.settingsService.getSetting('restaurant_open');
    if (isOnline && (isOnline.value === 'false' || isOnline.value === false)) {
      throw new BadRequestException('We are currently offline and not accepting orders.');
    }

    // Verify stock availability for all items
    if (orderData?.items && Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        const recipeId = item?.recipe?.id || item?.recipe?._id;
        if (recipeId !== undefined && recipeId !== null) {
          const filter = (typeof recipeId === 'string' && recipeId.match(/^[0-9a-fA-F]{24}$/))
            ? { _id: recipeId }
            : { id: Number(recipeId) };
          const recipeDoc = await this.recipeModel.findOne(filter).exec();
          if (recipeDoc && recipeDoc.inStock === false) {
            throw new BadRequestException(`"${recipeDoc.title}" is currently out of stock. Please remove it from your order.`);
          }
        }
      }
    }

    let guestAuth: any = null;
    let resolvedUserId = userId;

    const phone = orderData?.deliveryDetails?.phone;
    const name = orderData?.deliveryDetails?.name;
    const email = orderData?.deliveryDetails?.email;
    const address = orderData?.deliveryDetails?.address;

    // If user is not logged in, handle guest account association safely
    if (!resolvedUserId && phone) {
      try {
        const cleanP = this.usersService.cleanPhone(phone);
        const trimmedEmail = (email && email.trim()) ? email.trim().toLowerCase() : undefined;

        let targetUser: any = null;
        if (cleanP && cleanP.length >= 10) {
          targetUser = await this.usersService.findByPhone(cleanP);
        }
        if (!targetUser && trimmedEmail) {
          targetUser = await this.usersService.findByEmail(trimmedEmail);
        }

        if (targetUser) {
          const hasRealPassword = !!targetUser.passwordHash && !targetUser.needsPasswordSet;

          if (hasRealPassword) {
            // Established account with password: DO NOT auto-login as this user!
            resolvedUserId = targetUser._id.toString();
            guestAuth = null;
          } else {
            // Unverified guest account without password
            const targetEmail = targetUser.email?.toLowerCase();
            const emailConflicts = trimmedEmail && targetEmail && !targetEmail.endsWith('@foodybhai.in') && targetEmail !== trimmedEmail;

            if (emailConflicts) {
              const freshGuest = await this.usersService.createGuestUser(name, phone, trimmedEmail, address);
              resolvedUserId = freshGuest._id.toString();
              const token = this.authService.generateTokenForUser(freshGuest);
              guestAuth = {
                accessToken: token,
                user: {
                  id: freshGuest._id.toString(),
                  name: freshGuest.name,
                  email: freshGuest.email,
                  phone: freshGuest.phone,
                  role: freshGuest.role,
                  needsPasswordSet: true,
                  isGuestConverted: true,
                  addresses: freshGuest.addresses || [],
                }
              };
            } else {
              if (name && name.trim()) targetUser.name = name.trim();
              if (trimmedEmail && targetEmail?.endsWith('@foodybhai.in')) targetUser.email = trimmedEmail;
              await targetUser.save();

              resolvedUserId = targetUser._id.toString();
              const token = this.authService.generateTokenForUser(targetUser);
              guestAuth = {
                accessToken: token,
                user: {
                  id: targetUser._id.toString(),
                  name: targetUser.name,
                  email: targetUser.email,
                  phone: targetUser.phone,
                  role: targetUser.role,
                  needsPasswordSet: true,
                  isGuestConverted: true,
                  addresses: targetUser.addresses || [],
                }
              };
            }
          }
        } else {
          // Brand new guest user
          const newGuest = await this.usersService.createGuestUser(name, phone, trimmedEmail, address);
          if (newGuest) {
            resolvedUserId = newGuest._id.toString();
            const token = this.authService.generateTokenForUser(newGuest);
            guestAuth = {
              accessToken: token,
              user: {
                id: newGuest._id.toString(),
                name: newGuest.name,
                email: newGuest.email,
                phone: newGuest.phone,
                role: newGuest.role,
                needsPasswordSet: true,
                isGuestConverted: true,
                addresses: newGuest.addresses || [],
              }
            };
          }
        }
      } catch (err) {
        this.logger.error('Error handling guest user in order creation:', err);
      }
    }

    const order = new this.orderModel({
      userId: resolvedUserId,
      ...orderData
    });
    const saved = await order.save();
    this.emitOrderEvent('new_order', saved);

    const result: any = saved.toObject();
    if (guestAuth) {
      result.guestAuth = guestAuth;
    }
    return result;
  }

  async getUserOrders(userId: string, phone?: string): Promise<OrderDocument[]> {
    const orConditions: any[] = [{ userId }];
    if (phone) {
      const clean = this.usersService.cleanPhone(phone);
      orConditions.push({ 'deliveryDetails.phone': phone.trim() });
      if (clean && clean.length >= 10) {
        orConditions.push(
          { 'deliveryDetails.phone': clean },
          { 'deliveryDetails.phone': '0' + clean },
          { 'deliveryDetails.phone': '91' + clean },
          { 'deliveryDetails.phone': '+91' + clean }
        );
      }
    }
    return this.orderModel.find({ $or: orConditions }).sort({ createdAt: -1 }).exec();
  }

  async trackOrder(identifier: string): Promise<OrderDocument[]> {
    if (!identifier) throw new BadRequestException('Identifier is required');
    const trimmed = identifier.trim();
    const cleanDigits = this.usersService.cleanPhone(trimmed);

    // 1. Try finding by order ID (if valid Mongo ObjectId)
    if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
      const byId = await this.orderModel.findById(trimmed);
      if (byId) return [byId];
    }

    // 2. Try finding by phone number or email in deliveryDetails
    const orList: any[] = [
      { 'deliveryDetails.phone': trimmed },
      { 'deliveryDetails.email': trimmed.toLowerCase() },
    ];

    if (cleanDigits && cleanDigits.length >= 10) {
      orList.push(
        { 'deliveryDetails.phone': cleanDigits },
        { 'deliveryDetails.phone': '0' + cleanDigits },
        { 'deliveryDetails.phone': '91' + cleanDigits },
        { 'deliveryDetails.phone': '+91' + cleanDigits }
      );
    }

    // 3. If identifier is an email or phone, also search by matching user ID
    if (trimmed.includes('@')) {
      const user = await this.usersService.findByEmail(trimmed.toLowerCase());
      if (user) {
        orList.push({ userId: user._id });
      }
    }

    return this.orderModel.find({ $or: orList }).sort({ createdAt: -1 }).limit(10).exec();
  }

  async cancelOrderCustomer(orderId: string, reason: string): Promise<OrderDocument> {
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
    this.emitOrderEvent('cancel_requested', order);
    return order;
  }

  async processRefund(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { $set: { refundStatus: 'completed' } },
      { new: true }
    );
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }


  async getAllOrders(): Promise<OrderDocument[]> {
    // Sort by newest first
    return this.orderModel.find().populate('userId', 'name email phone').sort({ createdAt: -1 }).exec();
  }

  async updateOrderStatus(orderId: string, status: string, preparationTime?: number, deliveryAgent?: { name: string; phone: string }, cancelReason?: string): Promise<OrderDocument> {
    const existingOrder = await this.orderModel.findById(orderId);
    if (!existingOrder) throw new NotFoundException('Order not found');

    const updateData: any = { status };
    if (status === 'delivered') {
      updateData.paymentStatus = 'paid';
    } else if (status === 'preparing' && existingOrder.paymentMethod === 'online') {
      updateData.paymentStatus = 'paid';
    }
    if (status === 'cancelled' || status === 'rejected') {
      updateData.cancellationDetails = { cancelledBy: 'Restaurant' };
      if (cancelReason) updateData.cancellationDetails.reason = cancelReason;
      if (existingOrder.paymentMethod === 'online') {
        updateData.refundStatus = 'pending';
      }
    }
    if (preparationTime !== undefined) {
      updateData.preparationTime = preparationTime;
    }
    if (deliveryAgent) {
      updateData.deliveryAgent = deliveryAgent;
      if (existingOrder.reassignRequest && existingOrder.reassignRequest.status === 'pending') {
        updateData['reassignRequest.status'] = 'approved';
        updateData['reassignRequest.resolvedAt'] = new Date();
      }
    }

    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true }
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    this.emitOrderEvent('status_updated', order);
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
    doc.text(`Date: ${(order as any).createdAt ? new Date((order as any).createdAt).toLocaleString() : new Date().toLocaleString()}`);
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

  async requestCancel(id: string, reason: string): Promise<OrderDocument> {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      {
        $set: {
          cancelRequest: {
            requested: true,
            reason,
            status: 'pending'
          }
        }
      },
      { new: true }
    );
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async resolveCancelRequest(id: string, approve: boolean, processRefund: boolean = false): Promise<OrderDocument> {
    const existingOrder = await this.orderModel.findById(id);
    if (!existingOrder) throw new NotFoundException('Order not found');
    const updateData: any = {
      $set: {
        'cancelRequest.status': approve ? 'approved' : 'rejected'
      }
    };
    if (approve) {
      updateData.$set.status = 'cancelled';
      updateData.$set.cancellationDetails = { 
        cancelledBy: existingOrder.cancelRequest?.requestedBy || 'Delivery Agent', 
        reason: existingOrder.cancelRequest?.reason 
      };
      if (existingOrder.paymentMethod === 'online') {
        updateData.$set.refundStatus = processRefund ? 'completed' : 'pending';
      }
    }
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async requestReassign(id: string, reason: string, agentInfo?: { name: string; phone: string }): Promise<OrderDocument> {
    const existingOrder = await this.orderModel.findById(id);
    if (!existingOrder) throw new NotFoundException('Order not found');

    const agent = (agentInfo && agentInfo.phone) ? agentInfo : existingOrder.deliveryAgent;

    const order = await this.orderModel.findByIdAndUpdate(
      id,
      {
        $set: {
          reassignRequest: {
            requested: true,
            reason,
            status: 'pending',
            requestedByAgent: agent,
            requestedAt: new Date()
          }
        }
      },
      { new: true }
    );
    if (!order) throw new NotFoundException('Order not found');
    this.emitOrderEvent('reassign_requested', order);
    return order;
  }

  async resolveReassignRequest(id: string, approve: boolean, newAgent?: { name: string; phone: string }): Promise<OrderDocument> {
    const existingOrder = await this.orderModel.findById(id);
    if (!existingOrder) throw new NotFoundException('Order not found');

    const updateData: any = {
      $set: {
        'reassignRequest.status': approve ? 'approved' : 'rejected',
        'reassignRequest.resolvedAt': new Date()
      }
    };

    if (approve && newAgent) {
      updateData.$set.deliveryAgent = newAgent;
    }

    const order = await this.orderModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    if (!order) throw new NotFoundException('Order not found');
    this.emitOrderEvent('reassign_resolved', order);
    return order;
  }
}
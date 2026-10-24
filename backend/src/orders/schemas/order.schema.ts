import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ _id: false })
class DeliveryDetails {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: false })
  email?: string;
}

@Schema({ _id: false })
class OrderItem {
  @Prop({ type: Object, required: true })
  recipe: Record<string, any>;

  @Prop({ required: true })
  quantity: number;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ type: DeliveryDetails, required: true })
  deliveryDetails: DeliveryDetails;

  @Prop({ required: true, default: 'pending', enum: ['pending', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'rejected', 'cancelled'] })
  status: string;

  @Prop({ type: Number, default: 0 })
  preparationTime: number; // Time in minutes set by admin when accepting

  @Prop({ required: true, default: 'cod', enum: ['cod', 'online'] })
  paymentMethod: string;

  @Prop({ required: true, default: 'pending', enum: ['pending', 'paid', 'failed'] })
  paymentStatus: string;

  @Prop({ required: true, default: 'delivery', enum: ['delivery', 'pickup'] })
  orderType: string;

  @Prop({ type: Object, required: false })
  deliveryAgent?: { name: string; phone: string };

  @Prop({ required: false })
  itemTotal?: number;
  
  @Prop({ required: false })
  discount?: number;

  @Prop({ required: false, uppercase: true, trim: true })
  couponCode?: string;

  @Prop({ required: false })
  couponDiscount?: number;
  
  @Prop({ required: false })
  gst?: number;
  
  @Prop({ required: false })
  platformFee?: number;

  @Prop({ required: false, default: 0 })
  deliveryFee?: number;

  @Prop({ required: false, default: 0 })
  deliveryCharge?: number;

  @Prop({ required: false })
  rating?: number;

  @Prop({ required: false })
  review?: string;

  @Prop({ required: false, default: 'none', enum: ['none', 'pending', 'completed', 'failed'] })
  refundStatus?: string;

  @Prop({ type: Object, required: false })
  cancelRequest?: {
    requested: boolean;
    reason: string;
    status: string; // 'pending', 'approved', 'rejected'
    requestedBy?: string; // 'Customer', 'Delivery Agent'
  };

  @Prop({ type: Object, required: false })
  reassignRequest?: {
    requested: boolean;
    reason: string;
    status: string; // 'pending', 'approved', 'rejected'
    requestedByAgent?: { name: string; phone: string };
    requestedAt?: Date;
    resolvedAt?: Date;
  };

  @Prop({ type: Object, required: false })
  cancellationDetails?: {
    cancelledBy: string; // 'Restaurant', 'Customer', 'Delivery Agent'
    reason?: string;
  };

  createdAt?: Date;
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ 'deliveryDetails.phone': 1, createdAt: -1 });
OrderSchema.index({ 'deliveryDetails.email': 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ 'deliveryAgent.phone': 1, createdAt: -1 });
OrderSchema.index({ couponCode: 1 });

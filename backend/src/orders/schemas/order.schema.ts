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
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

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
  
  @Prop({ required: false })
  gst?: number;
  
  @Prop({ required: false })
  platformFee?: number;

  @Prop({ required: false })
  rating?: number;

  @Prop({ required: false })
  review?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

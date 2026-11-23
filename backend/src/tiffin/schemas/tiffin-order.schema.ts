import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TiffinOrderDocument = HydratedDocument<TiffinOrder>;

@Schema({ _id: false })
export class TiffinDeliveryAddress {
  @Prop({ required: true })
  street: string;

  @Prop({ required: false, default: '' })
  landmark: string;

  @Prop({ required: true })
  area: string;

  @Prop({ required: true, default: 'Meerut' })
  city: string;

  @Prop({ required: true, default: '250002' })
  pincode: string;
}

@Schema({ timestamps: true })
export class TiffinOrder {
  @Prop({ required: true, unique: true, index: true })
  orderId: string; // e.g., "TF-2611-1024"

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true, index: true })
  customerPhone: string;

  @Prop({ required: false, default: '' })
  customerEmail: string;

  @Prop({ required: true })
  planId: string;

  @Prop({ required: true })
  planName: string;

  @Prop({ required: true, enum: ['trial', 'weekly', 'monthly'], default: 'trial' })
  subscriptionType: 'trial' | 'weekly' | 'monthly';

  @Prop({ required: true, enum: ['lunch', 'dinner', 'both'], default: 'lunch' })
  mealSlot: 'lunch' | 'dinner' | 'both';

  @Prop({ required: true })
  startDate: string;

  @Prop({ required: true })
  endDate: string;

  @Prop({ required: true, min: 1, default: 1 })
  totalMeals: number;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ type: TiffinDeliveryAddress, required: true })
  deliveryAddress: TiffinDeliveryAddress;

  @Prop({ required: false, default: '' })
  specialInstructions: string;

  @Prop({ required: true, enum: ['cod', 'upi', 'online'], default: 'cod' })
  paymentMethod: 'cod' | 'upi' | 'online';

  @Prop({ required: true, enum: ['pending', 'paid', 'refunded'], default: 'pending' })
  paymentStatus: 'pending' | 'paid' | 'refunded';

  @Prop({ required: true, enum: ['active', 'paused', 'completed', 'cancelled'], default: 'active' })
  status: 'active' | 'paused' | 'completed' | 'cancelled';

  createdAt?: Date;
  updatedAt?: Date;
}

export const TiffinOrderSchema = SchemaFactory.createForClass(TiffinOrder);

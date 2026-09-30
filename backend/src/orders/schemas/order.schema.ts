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

  @Prop({ required: true, default: 'pending', enum: ['pending', 'processing', 'completed', 'cancelled'] })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

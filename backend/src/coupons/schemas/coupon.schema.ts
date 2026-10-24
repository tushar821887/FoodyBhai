import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CouponDocument = HydratedDocument<Coupon>;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: false, default: '' })
  description: string;

  @Prop({ required: true, enum: ['percentage', 'fixed'], default: 'percentage' })
  discountType: 'percentage' | 'fixed';

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ required: false, default: 0, min: 0 })
  minOrderAmount: number;

  @Prop({ required: false, default: 0, min: 0 })
  maxDiscount?: number; // Caps percentage discounts (0 = no cap)

  @Prop({ required: false, default: Date.now })
  validFrom: Date;

  @Prop({ required: false })
  validUntil?: Date;

  @Prop({ required: false, default: 0 })
  usageLimit?: number; // 0 = unlimited

  @Prop({ required: false, default: 1 })
  perUserLimit?: number; // 0 = unlimited

  @Prop({ required: false, default: 0 })
  usedCount: number;

  @Prop({ required: false, default: true })
  isActive: boolean;

  @Prop({ required: false, default: true })
  isPublic: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

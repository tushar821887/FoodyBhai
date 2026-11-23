import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TiffinPlanDocument = HydratedDocument<TiffinPlan>;

export interface DayMenu {
  day: string; // 'Monday', 'Tuesday', ...
  lunch: {
    main: string;
    dal: string;
    breadRice: string;
    sides: string;
    price?: number;
    time?: string;
  };
  dinner: {
    main: string;
    dal: string;
    breadRice: string;
    sides: string;
    price?: number;
    time?: string;
  };
}

@Schema({ timestamps: true })
export class TiffinPlan {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: false, default: '' })
  tagline: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['veg', 'non-veg', 'jain'], default: 'veg' })
  dietaryType: string;

  @Prop({ required: true, enum: ['lunch', 'dinner', 'both'], default: 'both' })
  mealType: string;

  @Prop({ required: true, min: 0 })
  trialPrice: number; // 1-day trial price

  @Prop({ required: true, min: 0 })
  weeklyPrice: number; // 7-day subscription price

  @Prop({ required: true, min: 0 })
  monthlyPrice: number; // 30-day subscription price

  @Prop({ required: false, min: 0 })
  perMealPrice: number;

  @Prop({ type: [String], default: [] })
  items: string[]; // e.g. ["4 Phulkas with Desi Ghee", "Dal Makhani", "Shahi Paneer", "Jeera Rice", "Salad & Achar"]

  @Prop({ required: false, default: '' })
  itemsHtml?: string;

  @Prop({ type: [String], default: [] })
  features: string[]; // e.g. ["Zero Soda & Preservatives", "100% RO Water Cooking", "Free On-Time Delivery", "Pause Anytime"]

  @Prop({ required: false, default: '' })
  featuresHtml?: string;

  @Prop({ required: false, default: '' })
  image: string;

  @Prop({ required: false, default: false })
  isPopular: boolean;

  @Prop({ required: false, default: false })
  isBestValue: boolean;

  @Prop({ required: false, default: true })
  isActive: boolean;

  @Prop({ required: false, default: 4.9 })
  rating: number;

  @Prop({ required: false, default: 128 })
  reviewsCount: number;

  @Prop({ required: false, default: '12:30 PM - 02:00 PM' })
  lunchDeliveryTime: string;

  @Prop({ required: false, default: '07:30 PM - 09:30 PM' })
  dinnerDeliveryTime: string;

  @Prop({ type: [Object], default: [] })
  weeklyMenu: DayMenu[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const TiffinPlanSchema = SchemaFactory.createForClass(TiffinPlan);

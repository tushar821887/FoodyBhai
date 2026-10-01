
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true, toJSON: { transform: (doc: any, ret: any) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; return ret; } } })
export class Category {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

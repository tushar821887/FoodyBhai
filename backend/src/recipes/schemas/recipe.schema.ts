import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RecipeDocument = HydratedDocument<Recipe>;

@Schema({ timestamps: true })
export class Recipe {
  @Prop({ unique: true })
  id: number; // Keeping legacy numeric ID if needed, but MongoDB has _id

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  introduction: string;

  @Prop({ required: true })
  category: string;

  @Prop({ default: 'Indian' })
  cuisine: string;

  @Prop()
  prepTime: string;

  @Prop()
  cookTime: string;

  @Prop()
  totalTime: string;

  @Prop({ default: 1 })
  servings: number;

  @Prop({ default: 'Easy' })
  difficulty: string;

  @Prop({ type: [String], default: [] })
  ingredients: string[];

  @Prop({ type: [String], default: [] })
  instructions: string[];

  @Prop({ type: [String], default: [] })
  tips: string[];

  @Prop()
  image: string;

  @Prop()
  imageAlt: string;

  @Prop()
  seoTitle: string;

  @Prop()
  seoDescription: string;

  @Prop({ default: true })
  isVeg: boolean;

  @Prop({ required: true })
  price: number;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);

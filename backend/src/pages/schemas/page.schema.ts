import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PageDocument = HydratedDocument<Page>;

@Schema({ _id: false })
export class SectionItem {
  @Prop()
  id?: string;

  @Prop()
  icon?: string;

  @Prop()
  title?: string;

  @Prop()
  subtitle?: string;

  @Prop()
  description?: string;

  @Prop()
  link?: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  rating?: number;

  @Prop()
  author?: string;

  @Prop()
  role?: string;

  @Prop()
  price?: number;
}

@Schema({ _id: false })
export class SectionStyle {
  @Prop({ default: '60px' })
  paddingTop?: string;

  @Prop({ default: '60px' })
  paddingBottom?: string;

  @Prop({ default: '1200px' })
  maxWidth?: string;

  @Prop()
  minHeight?: string;

  @Prop({ default: 'transparent' })
  backgroundColor?: string;

  @Prop()
  backgroundGradient?: string;

  @Prop()
  backgroundImage?: string;

  @Prop()
  textColor?: string;

  @Prop({ default: '36px' })
  titleFontSize?: string;

  @Prop({ default: '16px' })
  contentFontSize?: string;

  @Prop({ default: 'left' })
  textAlign?: string;

  @Prop({ default: '0px' })
  borderRadius?: string;

  @Prop({ default: 3 })
  gridColumns?: number;

  @Prop({ default: '24px' })
  gridGap?: string;
}

@Schema({ _id: false })
export class PageSection {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  title?: string;

  @Prop()
  subtitle?: string;

  @Prop()
  content?: string; // Rich HTML content edited via RichEditorComponent

  @Prop()
  badge?: string;

  @Prop()
  buttonText?: string;

  @Prop()
  buttonLink?: string;

  @Prop()
  secondaryButtonText?: string;

  @Prop()
  secondaryButtonLink?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ default: 'right' })
  imagePosition?: string;

  @Prop({ type: [SectionItem], default: [] })
  items?: SectionItem[];

  @Prop()
  rawHtml?: string;

  @Prop({ type: SectionStyle, default: () => ({}) })
  style: SectionStyle;

  @Prop({ default: true })
  isEnabled: boolean;
}

@Schema({ timestamps: true, collection: 'pages' })
export class Page {
  @Prop({ required: true, unique: true })
  slug: string; // e.g. "" for home, "offers", "catering", "about"

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  metaDescription: string;

  @Prop({ default: false })
  isCustomRoute: boolean;

  @Prop({ default: true })
  isEnabled: boolean;

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: [PageSection], default: [] })
  sections: PageSection[];
}

export const PageSchema = SchemaFactory.createForClass(Page);

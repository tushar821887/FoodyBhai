import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TiffinConfigDocument = HydratedDocument<TiffinConfig>;

@Schema({ timestamps: true })
export class TiffinConfig {
  @Prop({ type: Object, default: {} })
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    usps: string[];
    heroImage: string;
    ratingText: string;
    ratingSubtitle: string;
    lunchDeliveryTime: string;
    startingPriceText: string;
    orderBtnText: string;
    menuBtnText: string;
  };

  @Prop({ type: Object, default: {} })
  sectionHeader: {
    tag: string;
    title: string;
    desc: string;
  };

  @Prop({ type: Object, default: {} })
  weeklyMenuSection: {
    tag: string;
    title: string;
    desc: string;
    jainNote: string;
    menu: Array<{
      day: string;
      lunch: { main: string; dal: string; breadRice: string; sides: string; time?: string };
      dinner: { main: string; dal: string; breadRice: string; sides: string; time?: string };
    }>;
  };

  @Prop({ type: Array, default: [] })
  weeklyMenu: Array<{
    day: string;
    lunch: { main: string; dal: string; breadRice: string; sides: string; time?: string };
    dinner: { main: string; dal: string; breadRice: string; sides: string; time?: string };
  }>;

  @Prop({ type: Object, default: {} })
  howItWorks: {
    tag: string;
    title: string;
    desc: string;
    steps: Array<{
      stepNumber: number;
      title: string;
      description: string;
      icon?: string;
    }>;
  };

  @Prop({ type: Array, default: [] })
  trustHighlights: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;

  @Prop({ type: Object, default: {} })
  faqSection: {
    tag: string;
    title: string;
    desc: string;
    faqs: Array<{
      q: string;
      a: string;
    }>;
    supportBanner: {
      title: string;
      desc: string;
      phone: string;
    };
  };

  @Prop({ type: Array, default: [] })
  addons: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    description?: string;
    icon?: string;
    image?: string;
    inStock?: boolean;
  }>;
}

export const TiffinConfigSchema = SchemaFactory.createForClass(TiffinConfig);

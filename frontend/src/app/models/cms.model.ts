export interface SectionStyle {
  paddingTop?: string;          // e.g. '40px', '60px', '80px'
  paddingBottom?: string;       // e.g. '40px', '60px', '80px'
  maxWidth?: string;            // e.g. '1200px', '1000px', '800px', '100%'
  minHeight?: string;           // e.g. 'auto', '350px', '500px'
  backgroundColor?: string;     // e.g. '#ffffff', 'var(--background-light)'
  backgroundGradient?: string;  // e.g. 'var(--primary-gradient)'
  backgroundImage?: string;     // optional image URL
  textColor?: string;           // custom text color or inherit
  titleFontSize?: string;       // e.g. '28px', '36px', '44px', '52px'
  contentFontSize?: string;     // e.g. '15px', '16px', '18px'
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: string;        // e.g. '0px', '16px', '24px'
  gridColumns?: number;         // e.g. 2, 3, 4
  gridGap?: string;             // e.g. '16px', '24px', '32px'
}

export type SectionType = 
  | 'hero' 
  | 'about_story'
  | 'categories'
  | 'popular_menu'
  | 'features' 
  | 'rich_text' 
  | 'image_text' 
  | 'promo_cta' 
  | 'testimonials' 
  | 'faq' 
  | 'banner'
  | 'custom_html';

export interface CmsSectionItem {
  id?: string;
  icon?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  link?: string;
  imageUrl?: string;
  rating?: number;
  author?: string;
  role?: string;
}

export interface CmsSection {
  id: string;
  type: SectionType;
  title?: string;
  subtitle?: string;
  content?: string;
  badge?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  imageUrl?: string;
  imagePosition?: 'left' | 'right';
  items?: CmsSectionItem[];
  rawHtml?: string;
  style: SectionStyle;
  isEnabled: boolean;
}

export interface CmsPage {
  id: string;
  slug: string;             // e.g. 'home', 'about', 'offers', 'catering'
  title: string;            // e.g. 'Special Offers & Deals'
  metaDescription?: string; // SEO description
  isCustomRoute?: boolean;  // true for custom created routes
  isEnabled: boolean;
  sections: CmsSection[];
  updatedAt?: string;
}

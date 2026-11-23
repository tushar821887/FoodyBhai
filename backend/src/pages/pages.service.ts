import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Page, PageDocument } from './schemas/page.schema';

@Injectable()
export class PagesService implements OnModuleInit {
  private readonly logger = new Logger(PagesService.name);

  constructor(@InjectModel(Page.name) private pageModel: Model<PageDocument>) {}

  async onModuleInit() {
    await this.seedInitialPagesIfEmpty();
  }

  async findAll(): Promise<Page[]> {
    return this.pageModel.find().sort({ order: 1, createdAt: 1 }).exec();
  }

  async findBySlug(slug: string): Promise<Page | null> {
    const cleanSlug = (slug || '').toLowerCase().trim().replace(/^\//, '');
    let page = await this.pageModel.findOne({ slug: cleanSlug }).exec();
    if (!page && cleanSlug === 'home') {
      page = await this.pageModel.findOne({ slug: '' }).exec();
    }
    return page;
  }

  async create(pageData: Partial<Page>): Promise<Page> {
    const cleanSlug = (pageData.slug || '').toLowerCase().trim().replace(/^\//, '');
    const createdPage = new this.pageModel({
      ...pageData,
      slug: cleanSlug
    });
    return createdPage.save();
  }

  async update(slug: string, pageData: Partial<Page>): Promise<Page | null> {
    const cleanSlug = (slug || '').toLowerCase().trim().replace(/^\//, '');
    return this.pageModel.findOneAndUpdate(
      { slug: cleanSlug },
      { $set: pageData },
      { new: true, upsert: true }
    ).exec();
  }

  async bulkSave(pages: Partial<Page>[]): Promise<Page[]> {
    if (!pages || !Array.isArray(pages)) return [];

    const saved: Page[] = [];
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const cleanSlug = (p.slug || '').toLowerCase().trim().replace(/^\//, '');
      const updated = await this.pageModel.findOneAndUpdate(
        { slug: cleanSlug },
        { 
          $set: {
            title: p.title,
            metaDescription: p.metaDescription || '',
            isCustomRoute: !!p.isCustomRoute,
            isEnabled: p.isEnabled !== false,
            order: i,
            sections: p.sections || []
          } 
        },
        { new: true, upsert: true }
      ).exec();
      saved.push(updated);
    }
    return saved;
  }

  async remove(slug: string): Promise<any> {
    const cleanSlug = (slug || '').toLowerCase().trim().replace(/^\//, '');
    return this.pageModel.findOneAndDelete({ slug: cleanSlug }).exec();
  }

  private async seedInitialPagesIfEmpty(): Promise<void> {
    try {
      const count = await this.pageModel.countDocuments().exec();
      if (count > 0) {
        this.logger.log(`Found ${count} existing CMS pages in database.`);
        return;
      }

      this.logger.log('Seeding initial website pages & sections into MongoDB...');
      const defaultPages: Partial<Page>[] = [
        {
          slug: '',
          title: 'Home Page',
          metaDescription: 'Order delicious, hygienic, ghar-jaisa meals in Meerut delivered fast to your doorstep within 30 minutes.',
          isCustomRoute: false,
          isEnabled: true,
          order: 0,
          sections: [
            {
              id: 'sec-home-hero',
              type: 'hero',
              title: 'Experience <span>Premium</span> Food at Home.',
              subtitle: 'Meerut\'s finest premium kitchen bringing you freshly prepared, hygienic, and mouth-watering delicacies right to your doorstep.',
              badge: 'Takeaway & Delivery',
              badge2: 'Delivering in Meerut Area Only',
              buttonText: 'Order Here',
              buttonLink: '/menu',
              secondaryButtonText: 'Special Offers',
              secondaryButtonLink: '/page/offers',
              zomatoLink: 'https://www.zomato.com/meerut/foody-bhai-mohan-puri/order',
              swiggyLink: 'https://www.swiggy.com/city/meerut/foody-bhai-meerut-cantt-rest1404714',
              ratingValue: '4.3/5',
              ratingLabel: 'Foody Bhai Rating',
              imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
              imagePosition: 'right',
              items: [
                {
                  id: 'stat-1',
                  title: '30+',
                  description: 'Minutes Prep Time'
                },
                {
                  id: 'stat-2',
                  title: '100%',
                  description: 'Fresh Ingredients'
                },
                {
                  id: 'stat-3',
                  icon: 'fa-solid fa-star',
                  title: '4.3 ★',
                  description: 'Based on 200+ ratings'
                }
              ],
              style: {
                paddingTop: '48px',
                paddingBottom: '64px',
                maxWidth: '1200px',
                minHeight: '480px',
                backgroundColor: 'transparent',
                textAlign: 'left',
                titleFontSize: '52px',
                contentFontSize: '18px',
                borderRadius: '30px'
              },
              isEnabled: true
            },
            {
              id: 'sec-home-about',
              type: 'about_story',
              title: 'Welcome to FoodyBhai',
              subtitle: 'Your ultimate destination for discovering authentic, easy-to-follow, and delicious recipes and freshly cooked meals for every occasion.',
              badge: 'OUR HERITAGE & PASSION',
              content: '<p>FoodyBhai was born in Meerut out of a deep reverence for authentic, home-cooked North Indian culinary traditions. We believe great food doesn\'t just feed hunger—it comforts the soul. Every gravy is slow-simmered, every roti made fresh on order, and every spice hand-ground to preserve heritage aromatics.</p>',
              imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80',
              imagePosition: 'left',
              items: [
                {
                  id: 'feat-about-1',
                  icon: 'fa-solid fa-list-check',
                  title: 'Step-by-Step Instructions & Testing',
                  description: 'Every recipe is tested multiple times to guarantee rich taste and consistent perfection.'
                },
                {
                  id: 'feat-about-2',
                  icon: 'fa-solid fa-leaf',
                  title: '100% Pure & Authentic Ingredients',
                  description: 'Farm-fresh vegetables, cold-pressed oils, and pure desi ghee with no chemicals.'
                },
                {
                  id: 'feat-about-3',
                  icon: 'fa-solid fa-clock',
                  title: 'Quick, Hygienic & Punctual',
                  description: 'Prepared in strict sanitization and delivered sizzling hot within 30 minutes.'
                }
              ],
              style: {
                paddingTop: '60px',
                paddingBottom: '60px',
                maxWidth: '1200px',
                backgroundColor: 'var(--background-white)',
                textAlign: 'left',
                titleFontSize: '40px',
                contentFontSize: '16px',
                borderRadius: '16px'
              },
              isEnabled: true
            },
            {
              id: 'sec-home-categories',
              type: 'categories',
              title: 'Explore Categories',
              subtitle: 'Find exactly what you\'re craving by browsing our culinary categories.',
              badge: 'MENU SELECTIONS',
              buttonText: 'View All Menu',
              buttonLink: '/menu',
              style: {
                paddingTop: '50px',
                paddingBottom: '60px',
                maxWidth: '1200px',
                backgroundColor: 'var(--background-light)',
                textAlign: 'center',
                titleFontSize: '36px',
                contentFontSize: '16px',
                gridColumns: 4,
                gridGap: '20px',
                borderRadius: '20px'
              },
              isEnabled: true
            },
            {
              id: 'sec-home-popular-menu',
              type: 'popular_menu',
              title: 'Popular Menu',
              subtitle: 'Discover our most loved and highly-rated chef specials from the kitchen.',
              badge: 'CUSTOMER FAVORITES',
              buttonText: 'Browse Full Menu',
              buttonLink: '/menu',
              style: {
                paddingTop: '60px',
                paddingBottom: '60px',
                maxWidth: '1200px',
                backgroundColor: 'transparent',
                textAlign: 'center',
                titleFontSize: '36px',
                contentFontSize: '16px',
                gridColumns: 4,
                gridGap: '24px'
              },
              isEnabled: true
            },
            {
              id: 'sec-home-features',
              type: 'features',
              title: 'Why Meerut Loves Foody Bhai',
              subtitle: 'Four promises crafted into every single meal that leaves our kitchen.',
              badge: 'THE FOODYBHAI PROMISE',
              items: [
                {
                  id: 'feat-1',
                  icon: '🌿',
                  title: '100% Pure & Fresh',
                  description: 'Zero artificial preservatives. Handpicked spices and farm-fresh ingredients daily.'
                },
                {
                  id: 'feat-2',
                  icon: '⚡',
                  title: 'Lightning Fast Delivery',
                  description: 'Delivered hot and aromatic within 30 minutes right to your doorstep.'
                },
                {
                  id: 'feat-3',
                  icon: '🍲',
                  title: 'Ghar Jaisa Swad',
                  description: 'Homestyle slow-cooked gravies with authentic North Indian taste and aroma.'
                },
                {
                  id: 'feat-4',
                  icon: '🛡️',
                  title: 'Highest Hygiene Standards',
                  description: 'FSSAI certified kitchen, temperature checks, and triple-sealed safety packaging.'
                }
              ],
              style: {
                paddingTop: '60px',
                paddingBottom: '60px',
                maxWidth: '1200px',
                backgroundColor: 'var(--background-light)',
                textAlign: 'center',
                titleFontSize: '36px',
                contentFontSize: '16px',
                gridColumns: 4,
                gridGap: '24px',
                borderRadius: '16px'
              },
              isEnabled: true
            },
            {
              id: 'sec-home-cta',
              type: 'promo_cta',
              title: 'Hungry? Grab Flat 20% OFF Your First Order!',
              subtitle: 'Use coupon code FOODY20 at checkout and enjoy delicious meals delivered fast.',
              badge: 'LIMITED TIME OFFER',
              buttonText: 'Order Menu Now',
              buttonLink: '/menu',
              style: {
                paddingTop: '50px',
                paddingBottom: '50px',
                maxWidth: '1200px',
                backgroundGradient: 'var(--primary-gradient)',
                textColor: '#ffffff',
                textAlign: 'center',
                titleFontSize: '32px',
                contentFontSize: '17px',
                borderRadius: '24px'
              },
              isEnabled: true
            },
            {
              id: 'sec-home-testimonials',
              type: 'testimonials',
              title: 'What Meerut Says About Us',
              subtitle: 'Read genuine reviews from thousands of satisfied families and food lovers in Meerut.',
              badge: '⭐ 4.8 / 5.0 RATED',
              items: [
                {
                  id: 'rev-1',
                  title: 'Amit Sharma',
                  role: 'Shastri Nagar, Meerut',
                  description: 'Hands down the best Dal Makhani and Butter Paneer in Meerut! Delivery arrived in 25 mins steaming hot. Packaging was 10/10.',
                  rating: 5
                },
                {
                  id: 'rev-2',
                  title: 'Pooja Verma',
                  role: 'Meerut Cantt',
                  description: 'Ordered dinner for 8 family members during a party. Everyone loved the home-style spices. Not too oily, perfectly balanced!',
                  rating: 5
                },
                {
                  id: 'rev-3',
                  title: 'Rohan Gupta',
                  role: 'Saket, Meerut',
                  description: 'The FoodyBhai app is super smooth and the live order updates keep me informed. My go-to lunch place every single week.',
                  rating: 5
                }
              ],
              style: {
                paddingTop: '60px',
                paddingBottom: '60px',
                maxWidth: '1200px',
                backgroundColor: 'var(--background-light)',
                textAlign: 'center',
                titleFontSize: '36px',
                gridColumns: 3,
                gridGap: '24px',
                borderRadius: '20px'
              },
              isEnabled: true
            },
            {
              id: 'sec-home-app-download',
              type: 'image_text',
              title: 'Get the Foody Bhai Mobile App',
              subtitle: 'Enjoy lightning-fast ordering, real-time live GPS order alerts, and exclusive app-only discounts right from your smartphone.',
              badge: '📱 MOBILE APP AVAILABLE',
              buttonText: 'Download Android APK',
              buttonLink: '/downloads/foodybhai.apk',
              secondaryButtonText: 'Order Online',
              secondaryButtonLink: '/menu',
              imageUrl: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=700&q=80',
              imagePosition: 'right',
              style: {
                paddingTop: '60px',
                paddingBottom: '60px',
                maxWidth: '1200px',
                backgroundColor: 'var(--background-white)',
                textAlign: 'left',
                titleFontSize: '38px',
                contentFontSize: '16px',
                borderRadius: '20px'
              },
              isEnabled: true
            }
          ]
        },
        {
          slug: 'offers',
          title: 'Special Offers & Deals',
          metaDescription: 'Save big on authentic North Indian meals with exclusive Foody Bhai coupons and discounts.',
          isCustomRoute: true,
          isEnabled: true,
          order: 1,
          sections: [
            {
              id: 'sec-offers-hero',
              type: 'hero',
              title: 'Exclusive Deals & Super Combos',
              subtitle: 'Satisfy your cravings without breaking the bank. Exclusive discounts for online food lovers in Meerut.',
              badge: '🔥 TODAY\'S TOP SAVINGS',
              buttonText: 'Explore Menu',
              buttonLink: '/menu',
              style: {
                paddingTop: '60px',
                paddingBottom: '40px',
                maxWidth: '1200px',
                backgroundColor: 'transparent',
                textAlign: 'center',
                titleFontSize: '44px',
                contentFontSize: '18px'
              },
              isEnabled: true
            },
            {
              id: 'sec-offers-cards',
              type: 'features',
              title: 'Active Coupon Codes',
              subtitle: 'Apply these promo codes on your cart screen for instant bill discounts.',
              items: [
                {
                  id: 'c-1',
                  icon: '🎁',
                  title: 'FOODY20 — Flat 20% OFF',
                  description: 'Applicable on all orders above ₹249. Maximum discount ₹100. Valid today only.'
                },
                {
                  id: 'c-2',
                  icon: '👑',
                  title: 'ROYALFEAST — ₹150 OFF',
                  description: 'Valid on Family Thalis and Party Combos above ₹599. Perfect for weekend lunches!'
                },
                {
                  id: 'c-3',
                  icon: '🛵',
                  title: 'FREEDEL — Free Delivery',
                  description: 'Free doorstep delivery across Meerut on orders above ₹199.'
                }
              ],
              style: {
                paddingTop: '40px',
                paddingBottom: '60px',
                maxWidth: '1200px',
                gridColumns: 3,
                gridGap: '20px',
                textAlign: 'center',
                titleFontSize: '32px'
              },
              isEnabled: true
            }
          ]
        },
        {
          slug: 'catering',
          title: 'Party Orders & Bulk Catering',
          metaDescription: 'Book bulk food orders and live kitchen catering for birthdays, kitty parties, and corporate lunches in Meerut.',
          isCustomRoute: true,
          isEnabled: true,
          order: 2,
          sections: [
            {
              id: 'sec-catering-hero',
              type: 'hero',
              title: 'Make Your Special Gatherings Unforgettable',
              subtitle: 'From intimate house parties and kitty gatherings to corporate buffets — Foody Bhai provides gourmet food boxes and catering trays.',
              badge: '🎉 PARTY & CORPORATE CATERING',
              buttonText: 'Contact Our Chef',
              buttonLink: '/contact',
              imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
              imagePosition: 'right',
              style: {
                paddingTop: '60px',
                paddingBottom: '60px',
                maxWidth: '1200px',
                textAlign: 'left',
                titleFontSize: '42px',
                contentFontSize: '18px'
              },
              isEnabled: true
            },
            {
              id: 'sec-catering-faq',
              type: 'faq',
              title: 'Frequently Asked Catering Questions',
              subtitle: 'Everything you need to know about placing bulk orders with us.',
              items: [
                {
                  id: 'faq-1',
                  title: 'How many days in advance should I book?',
                  description: 'For orders between 15-50 people, 4 hours advance notice is sufficient. For larger gatherings (50+ people), please book 24 hours in advance.'
                },
                {
                  id: 'faq-2',
                  title: 'Are custom spices and Jain food options available?',
                  description: 'Yes! We customize spice levels (mild, medium, spicy) and provide separate 100% pure Jain preparation without onion and garlic upon request.'
                },
                {
                  id: 'faq-3',
                  title: 'Do you deliver bulk orders with warmers?',
                  description: 'Yes, all catering orders arrive in food-grade insulated thermocool containers with complimentary plates, spoons, and napkins.'
                }
              ],
              style: {
                paddingTop: '50px',
                paddingBottom: '60px',
                maxWidth: '1000px',
                backgroundColor: 'var(--background-light)',
                textAlign: 'center',
                titleFontSize: '32px',
                borderRadius: '16px'
              },
              isEnabled: true
            }
          ]
        }
      ];

      for (const page of defaultPages) {
        await this.pageModel.create(page);
      }
      this.logger.log('✅ Successfully seeded default website pages in MongoDB pages collection.');
    } catch (err: any) {
      this.logger.warn('Error during pages seeding check:', err.message);
    }
  }
}

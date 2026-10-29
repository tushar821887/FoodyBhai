import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from './schemas/setting.schema';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(Setting.name) private settingModel: Model<SettingDocument>) {}

  async getSetting(key: string): Promise<any> {
    const setting = await this.settingModel.findOne({ key }).exec();
    if (setting && setting.value !== undefined && setting.value !== null) {
      return setting.value;
    }

    const defaults: Record<string, any> = {
      restaurant_open: 'true',
      foodybhai_upi: '8218870579@ptyes',
      app_version: '1.0.0',
      app_download_url: '/downloads/foodybhai.apk',
      app_release_notes: 'Real-time order alerts, smoother performance, and instant order tracking.',
      tax_gst_percent: '5',
      platform_fee: '5',
      delivery_fee: '0',
      free_delivery_min_amount: '0',
      cart_offers_config: {
        enabled: true,
        title: 'Available Offers',
        subtitle: 'Tap to view coupons & deals',
        buttonText: 'View Offers',
        displayMode: 'popup',
        maxOffersToShow: 5
      },
      promo_banner: {
        enabled: true,
        text: '🎉 Special Offer! Get 20% OFF on all orders today! Use code FOODY20 at checkout! 🎉',
        badgeText: 'SPECIAL OFFER',
        badgeBg: '#ffffff',
        badgeColor: '#ea580c',
        bgColor: '#ea580c',
        bgGradientEnd: '#f97316',
        isGradient: true,
        textColor: '#ffffff',
        height: '34px',
        fontSize: '13px',
        alignment: 'center',
        isMarquee: true,
        marqueeSpeed: 'normal',
        linkUrl: '/menu',
        closeable: false
      },
      header_config: {
        logoUrl: '/assets/images/logo.png',
        logoAlt: 'Foody Bhai Logo',
        logoLink: '/',
        logoHeight: '48px',
        logoWidth: 'auto',
        logoShape: 'circle',
        logoBorderWidth: '1.5px',
        logoBorderColor: '#f97316',
        logoGap: '14px',
        navGap: '20px',
        actionsGap: '14px',
        showLocation: true,
        deliveringToLabel: 'Delivering to',
        defaultLocationText: 'Meerut, Uttar Pradesh, India',
        actionItems: [
          {
            id: 'phone',
            type: 'phone',
            label: '+91 8218870579',
            icon: 'fa-solid fa-phone',
            url: 'tel:8218870579',
            enabled: true,
            displayMode: 'icon-and-label',
            variant: 'ghost',
            fontSize: '13.5px',
            fontWeight: '600'
          },
          {
            id: 'app-download',
            type: 'app-download',
            label: 'Get App',
            loggedInLabel: 'Update App',
            icon: 'fa-solid fa-mobile-screen-button',
            url: '/download-app',
            enabled: true,
            displayMode: 'icon-and-label',
            variant: 'outline',
            borderRadius: '24px'
          },
          {
            id: 'cart',
            type: 'cart',
            label: 'Cart',
            icon: 'fa-solid fa-cart-shopping',
            url: '/cart',
            enabled: true,
            displayMode: 'icon-and-label',
            variant: 'ghost',
            showBadge: true
          },
          {
            id: 'account',
            type: 'account',
            label: 'Login',
            loggedInLabel: 'Account',
            icon: 'fa-solid fa-user',
            url: '/profile',
            enabled: true,
            displayMode: 'icon-and-label',
            variant: 'solid',
            bgColor: '#059669',
            color: '#ffffff',
            borderRadius: '24px'
          }
        ],
        navLinks: [
          { label: 'Home', url: '/', exact: true },
          { 
            label: 'Menu', 
            url: '/menu', 
            exact: false,
            badge: 'POPULAR',
            badgeColor: '#ea580c',
            hasDropdown: true,
            children: [
              { label: 'All Dishes', url: '/menu', icon: '🍽️', description: 'Explore our full freshly made menu' },
              { label: 'Main Course & Curries', url: '/menu?cat=main-course', icon: '🍛', description: 'Paneer, Dal Makhani & rich gravies' },
              { label: 'Breads, Naan & Rice', url: '/menu?cat=breads-rice', icon: '🫓', description: 'Tandoori roti, butter naan & biryani' },
              { label: 'Snacks & Starters', url: '/menu?cat=snacks', icon: '🥟', description: 'Crispy samosas, pakoras & rolls' },
              { label: 'Desserts & Sweets', url: '/menu?cat=desserts', icon: '🍨', description: 'Gulab jamun, rasmalai & ice cream' }
            ]
          },
          { label: 'About', url: '/about', exact: false },
          { label: 'Contact', url: '/contact', exact: false }
        ],
        showPhone: true,
        phoneText: '+91 8218870579',
        phoneTel: '8218870579',
        showAppButton: true,
        appButtonText: 'Get App',
        appUpdateText: 'Update App',
        appButtonStyle: 'soft',
        showCart: true,
        cartLabel: 'Cart',
        showAccount: true,
        loginLabel: 'Login',
        accountLabel: 'Account',
        loginButtonStyle: 'pill',
        buttonRadius: '24px',
        isSticky: true,
        hasShadow: true,
        shadowStyle: 'soft',
        bgColor: '#ffffff',
        textColor: '#1e293b',
        accentColor: '#059669',
        hoverColor: '#047857',
        headerHeight: 'standard',
        containerWidth: '1200px',
        headerRadius: '0px',
        enableGlassmorphism: false,
        glassmorphismBlur: '12px',
        borderBottomWidth: '1px',
        borderBottomColor: '#f1f5f9',
        navFontSize: '14px',
        navFontWeight: '600',
        navTextTransform: 'none',
        navLetterSpacing: '0px',
        navActiveStyle: 'underline',
        subcatNameFontSize: '13.5px',
        subcatNameFontWeight: '700',
        subcatNameColor: '#0f172a',
        subcatDescFontSize: '11.5px',
        subcatDescColor: '#64748b',
        subcatDescFontWeight: '400',
        subcatIconSize: '22px',
        subcatHoverBg: '#f8fafc',
        subcatItemRadius: '10px',
        dropdownStyle: 'light',
        dropdownColumns: '1'
      },
      footer_config: {
        tagline: 'Ghar jaisa swaad, har baar!',
        aboutText: 'Meerut\'s favourite cloud kitchen delivering fresh, hygienic, and authentic home-style food right to your doorstep.',
        phone: '+91 8218870579',
        email: 'contact@foodybhai.in',
        address: '226 Bhatwara, Budhana Gate, Meerut, Uttar Pradesh 250002',
        copyrightText: '© 2026 Foody Bhai. All rights reserved.',
        showSocial: true,
        instagramUrl: 'https://instagram.com',
        facebookUrl: 'https://facebook.com',
        twitterUrl: 'https://twitter.com'
      },
      website_theme: {
        id: 'foodybhai-signature',
        name: 'Foody Bhai Signature (Warm Saffron & Espresso)',
        primaryColor: '#f95f00',
        primaryHover: '#ea580c',
        primaryDark: '#c2410c',
        primaryLight: '#fff5ed',
        primaryBorder: '#fed7aa',
        primaryGlow: 'rgba(249, 95, 0, 0.25)',
        secondaryColor: '#241814',
        secondaryLight: '#3e2d26',
        backgroundLight: '#fbf6f2',
        backgroundWhite: '#ffffff',
        textDark: '#241814',
        textLight: '#716661',
        gradientStart: '#ff6e1a',
        gradientEnd: '#ea580c',
        gradientAngle: '135deg',
        marqueeStart: '#ea580c',
        marqueeEnd: '#f97316'
      },
      website_pages: [
        {
          id: 'page-home',
          slug: '',
          title: 'Home Page',
          metaDescription: 'Order delicious, hygienic, ghar-jaisa meals in Meerut delivered fast to your doorstep.',
          isCustomRoute: false,
          isEnabled: true,
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
              title: 'Welcome to <span>FoodyBhai</span>',
              subtitle: 'Your ultimate destination for discovering authentic, easy-to-follow, and delicious recipes for every occasion.',
              badge: 'OUR STORY & PASSION',
              content: '<p>FoodyBhai was born in Meerut out of a deep reverence for authentic, home-cooked North Indian culinary traditions. Every gravy is slow-simmered, rotis made fresh on order, and every spice hand-ground to preserve heritage aromatics.</p>',
              imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80',
              imagePosition: 'left',
              items: [
                {
                  id: 'feat-1',
                  icon: 'fa-solid fa-list-check',
                  title: 'Step-by-Step Instructions',
                  description: 'Clear, detailed, and tested recipes that guarantee perfect results every time.'
                },
                {
                  id: 'feat-2',
                  icon: 'fa-solid fa-leaf',
                  title: 'Authentic Ingredients',
                  description: 'Learn the secrets of traditional cooking with accessible ingredients.'
                },
                {
                  id: 'feat-3',
                  icon: 'fa-solid fa-clock',
                  title: 'Quick & Easy',
                  description: 'Find meals that fit your schedule, from 15-minute snacks to elaborate weekend feasts.'
                }
              ],
              style: {
                paddingTop: '60px',
                paddingBottom: '60px',
                maxWidth: '1200px',
                backgroundColor: 'var(--background-white)',
                textAlign: 'left',
                titleFontSize: '38px',
                borderRadius: '16px'
              },
              isEnabled: true
            },
            {
              id: 'sec-home-categories',
              type: 'categories',
              title: 'Explore <span>Categories</span>',
              subtitle: 'Find exactly what you\'re craving by browsing our recipe categories.',
              badge: 'MENU SELECTIONS',
              buttonText: 'View All Menu',
              buttonLink: '/menu',
              style: {
                paddingTop: '60px',
                paddingBottom: '60px',
                maxWidth: '1200px',
                backgroundColor: 'var(--background-light)',
                textAlign: 'center',
                titleFontSize: '36px',
                gridColumns: 4,
                borderRadius: '20px'
              },
              isEnabled: true
            },
            {
              id: 'sec-home-popular-menu',
              type: 'popular_menu',
              title: 'Popular <span>Menu</span>',
              subtitle: 'Discover our most loved and highly-rated recipes from the community.',
              badge: 'CUSTOMER FAVORITES',
              buttonText: 'Browse Full Menu',
              buttonLink: '/menu',
              style: {
                paddingTop: '60px',
                paddingBottom: '60px',
                maxWidth: '1200px',
                textAlign: 'center',
                titleFontSize: '36px',
                gridColumns: 4
              },
              isEnabled: true
            },
            {
              id: 'sec-home-features',
              type: 'features',
              title: 'Why Meerut Loves <span>Foody Bhai</span>',
              subtitle: 'Four promises crafted into every single meal that leaves our kitchen.',
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
              subtitle: 'Real reviews from hungry customers across Meerut.',
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
              id: 'sec-home-banner',
              type: 'banner',
              title: 'Get the Foody Bhai Mobile App',
              subtitle: 'Enjoy lightning-fast ordering, real-time live GPS order alerts, and exclusive app-only discounts right from your smartphone.',
              badge: '📱 MOBILE APP AVAILABLE',
              buttonText: 'Download Android APK',
              buttonLink: '/downloads/foodybhai.apk',
              imageUrl: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=700&q=80',
              style: {
                paddingTop: '60px',
                paddingBottom: '60px',
                maxWidth: '1200px',
                backgroundColor: 'var(--background-white)',
                borderRadius: '20px'
              },
              isEnabled: true
            }
          ]
        },
        {
          id: 'page-offers',
          slug: 'offers',
          title: 'Special Offers & Deals',
          metaDescription: 'Save big on authentic North Indian meals with exclusive Foody Bhai coupons and discounts.',
          isCustomRoute: true,
          isEnabled: true,
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
          id: 'page-catering',
          slug: 'catering',
          title: 'Party Orders & Bulk Catering',
          metaDescription: 'Book bulk food orders and live kitchen catering for birthdays, kitty parties, and corporate lunches in Meerut.',
          isCustomRoute: true,
          isEnabled: true,
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
      ]
    };
    return defaults[key] !== undefined ? defaults[key] : null;
  }

  async setSetting(key: string, value: any): Promise<void> {
    await this.settingModel.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    ).exec();
  }

  async getAllSettings(): Promise<any> {
    const settings = await this.settingModel.find().exec();
    const result: Record<string, any> = {};
    settings.forEach(s => result[s.key] = s.value);
    return result;
  }
}

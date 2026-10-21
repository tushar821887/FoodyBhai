import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { CmsPage } from '../models/cms.model';

const STORAGE_KEY = 'foodybhai_cms_pages';

export const DEFAULT_WEBSITE_PAGES: CmsPage[] = [
  {
    id: 'page-home',
    slug: '',
    title: 'Home Page',
    metaDescription: 'Order delicious, hygienic, ghar-jaisa meals in Meerut delivered fast to your doorstep within 30 minutes.',
    isCustomRoute: false,
    isEnabled: true,
    sections: [
      {
        id: 'sec-home-hero',
        type: 'hero',
        title: 'Experience <span>Premium</span> Food at Home.',
        subtitle: 'Meerut\'s finest premium kitchen bringing you freshly prepared, hygienic, and mouth-watering delicacies right to your doorstep.',
        badge: 'Takeaway & Delivery',
        buttonText: 'Order Here',
        buttonLink: '/menu',
        secondaryButtonText: 'Special Offers',
        secondaryButtonLink: '/page/offers',
        imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
        imagePosition: 'right',
        style: {
          paddingTop: '40px',
          paddingBottom: '40px',
          maxWidth: '1200px',
          backgroundColor: 'transparent',
          titleFontSize: '44px'
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
];

@Injectable({
  providedIn: 'root'
})
export class CmsService {
  private pagesSubject = new BehaviorSubject<CmsPage[]>(DEFAULT_WEBSITE_PAGES);
  public pages$: Observable<CmsPage[]> = this.pagesSubject.asObservable();

  private api = inject(ApiService);

  constructor() {
    this.initializePages();
  }

  private initializePages() {
    if (typeof window === 'undefined') return;

    // 1. Read cached
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.pagesSubject.next(parsed);
        }
      } catch (e) {
        console.warn('Failed to parse cached pages', e);
      }
    }

    // 2. Fetch live
    this.fetchLivePages().subscribe();
  }

  fetchLivePages(): Observable<CmsPage[]> {
    return this.api.getPages().pipe(
      map(res => {
        let pages: any[] = [];
        if (Array.isArray(res)) {
          pages = res;
        } else if (res && Array.isArray(res.value)) {
          pages = res.value;
        } else if (res && Array.isArray(res.pages)) {
          pages = res.pages;
        }
        return pages as CmsPage[];
      }),
      tap(pages => {
        if (pages && pages.length > 0) {
          this.pagesSubject.next(pages);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
          }
        }
      }),
      catchError(err => {
        console.warn('Could not fetch database pages, trying settings fallback...', err);
        return this.api.getSetting('website_pages').pipe(
          map(res => (res && res.value && Array.isArray(res.value) ? res.value : []) as CmsPage[]),
          tap(pages => {
            if (pages && pages.length > 0) {
              this.pagesSubject.next(pages);
            }
          }),
          catchError(() => of(this.pagesSubject.value))
        );
      })
    );
  }

  getAllPages(): CmsPage[] {
    return this.pagesSubject.value;
  }

  getPageBySlug(slug: string): Observable<CmsPage | null> {
    const cleanSlug = (slug || '').toLowerCase().trim().replace(/^\//, '');
    return this.pages$.pipe(
      map(pages => {
        const found = pages.find(p => {
          const s = (p.slug || '').toLowerCase().trim().replace(/^\//, '');
          return s === cleanSlug;
        });
        return found || null;
      })
    );
  }

  saveAllPages(pages: CmsPage[]): Observable<any> {
    return this.api.savePages(pages).pipe(
      tap(() => {
        this.pagesSubject.next(pages);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
        }
        this.notifyWebsiteSync();
        // Also save to settings for backward compatibility
        this.api.saveSetting('website_pages', pages).subscribe({ error: () => {} });
      }),
      catchError(err => {
        console.warn('PUT /pages/bulk failed (status: ' + err?.status + '), falling back to PUT /settings/website_pages...', err);
        return this.api.saveSetting('website_pages', pages).pipe(
          tap(() => {
            this.pagesSubject.next(pages);
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
            }
            this.notifyWebsiteSync();
          })
        );
      })
    );
  }

  deletePageBySlug(slug: string): Observable<any> {
    return this.api.deletePage(slug).pipe(
      tap(() => {
        const updated = this.pagesSubject.value.filter(p => p.slug !== slug);
        this.pagesSubject.next(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
        this.notifyWebsiteSync();
      })
    );
  }

  private notifyWebsiteSync() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('foodybhai_cms_last_published', Date.now().toString());
        if ('BroadcastChannel' in window) {
          const channel = new BroadcastChannel('foodybhai_cms_channel');
          channel.postMessage({ type: 'PAGES_UPDATED', timestamp: Date.now() });
          setTimeout(() => channel.close(), 100);
        }
      } catch (e) {
        console.warn('Broadcast sync notice failed', e);
      }
    }
  }
}

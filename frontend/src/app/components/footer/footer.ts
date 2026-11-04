import { Component, OnInit, ChangeDetectorRef, NgZone, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppUpdateService } from '../../services/app-update.service';
import { OrderService } from '../../services/order.service';

export interface FooterItem {
  id: string;
  label: string;
  url?: string;
  icon?: string;
  type?: 'link' | 'contact' | 'app-download' | 'text';
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
  openInNewTab?: boolean;
  enabled?: boolean;
  color?: string;
  hoverColor?: string;
  fontSize?: string;
  fontWeight?: string;
}

export interface FooterSection {
  id: string;
  title: string;
  enabled: boolean;
  type?: 'links' | 'contact' | 'text';
  showUnderline?: boolean;
  items: FooterItem[];
  titleColor?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  underlineColor?: string;
  itemsColor?: string;
  itemsHoverColor?: string;
  itemsFontSize?: string;
  itemsFontWeight?: string;
  columnSpan?: number;
}

export interface FooterSocialLink {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'whatsapp' | 'linkedin' | 'custom';
  name: string;
  url: string;
  icon: string;
  enabled: boolean;
}

export interface FooterConfig {
  showBrandColumn: boolean;
  logoUrl?: string;
  logoAlt?: string;
  logoHeight?: string;
  logoShape?: 'circle' | 'rounded' | 'natural';
  logoBorderColor?: string;
  tagline?: string;
  aboutText?: string;
  showSocial: boolean;
  socialStyle?: 'circle' | 'pill' | 'square' | 'ghost';
  socialLinks: FooterSocialLink[];

  sections: FooterSection[];

  columnsPerRow: '2' | '3' | '4' | '5' | 'auto';
  columnsGap?: string;
  containerWidth?: string;
  brandColumnSpan?: '1' | '1.5' | '1.8' | '2';

  bgColor: string;
  textColor: string;
  headingColor: string;
  accentColor: string;
  hoverColor: string;
  showTitleUnderline: boolean;
  titleUnderlineColor?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  titleTextTransform?: 'none' | 'uppercase' | 'capitalize';
  linksFontSize?: string;
  paddingTop?: string;
  paddingBottom?: string;

  showBottomBar: boolean;
  copyrightText: string;
  bottomBarBg?: string;
  bottomBarTextColor?: string;
  bottomBarBorderColor?: string;
  bottomBarAlign?: 'center' | 'space-between';
}

export const DEFAULT_FOOTER_SOCIAL_LINKS: FooterSocialLink[] = [
  { id: 'soc_fb', platform: 'facebook', name: 'Facebook', url: 'https://facebook.com', icon: 'fa-brands fa-facebook-f', enabled: true },
  { id: 'soc_ig', platform: 'instagram', name: 'Instagram', url: 'https://instagram.com', icon: 'fa-brands fa-instagram', enabled: true },
  { id: 'soc_tw', platform: 'twitter', name: 'Twitter', url: 'https://twitter.com', icon: 'fa-brands fa-twitter', enabled: true }
];

export const DEFAULT_FOOTER_SECTIONS: FooterSection[] = [
  {
    id: 'sec_quick_links',
    title: 'Quick Links',
    enabled: true,
    type: 'links',
    showUnderline: true,
    items: [
      { id: 'it_home', label: 'Home', url: '/', enabled: true, type: 'link' },
      { id: 'it_menu', label: 'Menu', url: '/menu', enabled: true, type: 'link' },
      { id: 'it_about', label: 'About Us', url: '/about', enabled: true, type: 'link' },
      { id: 'it_contact', label: 'Contact', url: '/contact', enabled: true, type: 'link' },
      { id: 'it_app', label: 'Download Android App', url: '', icon: 'fa-solid fa-mobile-screen-button', enabled: true, type: 'app-download', color: '#10b981', fontWeight: '600' }
    ]
  },
  {
    id: 'sec_legal',
    title: 'Legal',
    enabled: true,
    type: 'links',
    showUnderline: true,
    items: [
      { id: 'it_privacy', label: 'Privacy Policy', url: '/privacy-policy', enabled: true, type: 'link' },
      { id: 'it_terms', label: 'Terms & Conditions', url: '/terms', enabled: true, type: 'link' },
      { id: 'it_disclaimer', label: 'Disclaimer', url: '/disclaimer', enabled: true, type: 'link' }
    ]
  },
  {
    id: 'sec_contact',
    title: 'Contact Us',
    enabled: true,
    type: 'contact',
    showUnderline: true,
    items: [
      { id: 'it_loc', label: '127, Bhatwara, Bagh Wali Gali, Meerut - 250002', icon: 'fa-solid fa-location-dot', enabled: true, type: 'contact' },
      { id: 'it_phone', label: '8218870579', url: 'tel:8218870579', icon: 'fa-solid fa-phone', enabled: true, type: 'contact' },
      { id: 'it_email', label: 'tusharmanusharma@gmail.com', url: 'mailto:tusharmanusharma@gmail.com', icon: 'fa-solid fa-envelope', enabled: true, type: 'contact' }
    ]
  }
];

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  showBrandColumn: true,
  logoUrl: 'assets/images/logo.png',
  logoAlt: 'Foody Bhai Logo',
  logoHeight: '80px',
  logoShape: 'natural',
  logoBorderColor: '#ea580c',
  tagline: 'Ghar jaisa swaad, har baar!',
  aboutText: 'Your ultimate destination for discovering authentic, easy-to-follow, and delicious recipes. We make cooking at home simple and fun.',
  showSocial: true,
  socialStyle: 'circle',
  socialLinks: DEFAULT_FOOTER_SOCIAL_LINKS,

  sections: DEFAULT_FOOTER_SECTIONS,

  columnsPerRow: '4',
  columnsGap: '2rem',
  containerWidth: '1280px',
  brandColumnSpan: '1.8',

  bgColor: '#071811',
  textColor: '#a4b0be',
  headingColor: '#ffffff',
  accentColor: '#10b981',
  hoverColor: '#10b981',
  showTitleUnderline: true,
  titleUnderlineColor: '#10b981',
  titleFontSize: '1.2rem',
  titleFontWeight: '700',
  titleTextTransform: 'none',
  linksFontSize: '14px',
  paddingTop: '4rem',
  paddingBottom: '0',

  showBottomBar: true,
  copyrightText: '© {year} FoodyBhai. All Rights Reserved.',
  bottomBarBg: 'transparent',
  bottomBarTextColor: '#a4b0be',
  bottomBarBorderColor: 'rgba(255, 255, 255, 0.1)',
  bottomBarAlign: 'center'
};

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer implements OnInit {
  private orderService = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  footerConfig: FooterConfig = JSON.parse(JSON.stringify(DEFAULT_FOOTER_CONFIG));

  constructor(public appUpdateService: AppUpdateService) {}

  ngOnInit() {
    this.loadFooterConfig();
  }

  loadFooterConfig() {
    // 1. Instant fallback from localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem('foodybhai_footer_config');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            this.footerConfig = { ...DEFAULT_FOOTER_CONFIG, ...parsed };
          }
        }
      }
    } catch (e) {}

    // 2. Fetch live settings from API
    this.orderService.getSetting('footer_config').subscribe({
      next: (res) => {
        if (res && res.value !== undefined && res.value !== null) {
          try {
            const parsed = typeof res.value === 'string' ? JSON.parse(res.value) : res.value;
            if (parsed && typeof parsed === 'object') {
              this.footerConfig = { ...DEFAULT_FOOTER_CONFIG, ...parsed };
              if (!Array.isArray(this.footerConfig.sections) || this.footerConfig.sections.length === 0) {
                this.footerConfig.sections = JSON.parse(JSON.stringify(DEFAULT_FOOTER_SECTIONS));
              }
              if (!Array.isArray(this.footerConfig.socialLinks) || this.footerConfig.socialLinks.length === 0) {
                this.footerConfig.socialLinks = JSON.parse(JSON.stringify(DEFAULT_FOOTER_SOCIAL_LINKS));
              }
              try {
                if (typeof localStorage !== 'undefined') {
                  localStorage.setItem('foodybhai_footer_config', JSON.stringify(this.footerConfig));
                }
              } catch (e) {}
            }
          } catch (e) {
            console.error('Error parsing footer_config:', e);
          }
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });

    // 3. Listen for broadcast channel updates
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('foodybhai_footer_channel');
        ch.onmessage = (ev) => {
          if (ev.data && ev.data.config) {
            this.ngZone.run(() => {
              this.footerConfig = { ...DEFAULT_FOOTER_CONFIG, ...ev.data.config };
              try {
                localStorage.setItem('foodybhai_footer_config', JSON.stringify(this.footerConfig));
              } catch (e) {}
              this.cdr.detectChanges();
            });
          }
        };
      }
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', (ev) => {
          if (ev.key === 'foodybhai_footer_config' && ev.newValue) {
            try {
              this.footerConfig = { ...DEFAULT_FOOTER_CONFIG, ...JSON.parse(ev.newValue) };
              this.cdr.detectChanges();
            } catch (e) {}
          }
        });
      }
    } catch (e) {}
  }

  getGridTemplateColumns(): string {
    const cols = this.footerConfig.columnsPerRow || '4';
    const brandSpan = this.footerConfig.brandColumnSpan || '1.8';
    const showBrand = this.footerConfig.showBrandColumn !== false;

    if (cols === 'auto') {
      return 'repeat(auto-fit, minmax(220px, 1fr))';
    }

    const numCols = parseInt(cols, 10) || 4;
    if (showBrand) {
      const sectionCols = Math.max(1, numCols - 1);
      return `minmax(260px, ${brandSpan}fr) repeat(${sectionCols}, 1fr)`;
    } else {
      return `repeat(${numCols}, 1fr)`;
    }
  }

  getVisibleSections(): FooterSection[] {
    if (!this.footerConfig.sections) return [];
    return this.footerConfig.sections.filter(s => s.enabled !== false);
  }

  getVisibleItems(sec: FooterSection): FooterItem[] {
    if (!sec.items) return [];
    return sec.items.filter(item => item.enabled !== false);
  }

  getVisibleSocialLinks(): FooterSocialLink[] {
    if (!this.footerConfig.socialLinks) return [];
    return this.footerConfig.socialLinks.filter(s => s.enabled !== false);
  }

  getFormattedCopyright(): string {
    const text = this.footerConfig.copyrightText || '© {year} FoodyBhai. All Rights Reserved.';
    const year = new Date().getFullYear().toString();
    return text.replace('{year}', year);
  }

  isExternalUrl(url?: string): boolean {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('tel:') || url.startsWith('mailto:');
  }

  isFontAwesome(icon?: string): boolean {
    if (!icon) return false;
    return icon.includes('fa-') || icon.includes('fas ') || icon.includes('fab ') || icon.includes('far ');
  }
}

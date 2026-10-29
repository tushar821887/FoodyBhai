import { Component, HostListener, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { LocationService } from '../../services/location.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { OrderService } from '../../services/order.service';
import { AuthModalComponent } from '../auth-modal/auth-modal';
import { AppUpdateService } from '../../services/app-update.service';

export interface HeaderNavSubItem {
  label: string;
  url: string;
  icon?: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;
  enabled?: boolean;

  // Particular individual styles for this subcategory
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  descColor?: string;
  descFontSize?: string;
  bgColor?: string;
  borderColor?: string;
}

export interface HeaderNavLink {
  label: string;
  url: string;
  exact?: boolean;
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;
  icon?: string;
  enabled?: boolean;
  hasDropdown?: boolean;

  // Particular individual styles for this menu link
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  highlightBg?: string;
  highlightBorder?: string;

  children?: HeaderNavSubItem[];
}

export interface HeaderActionItem {
  id: string;
  type: 'cart' | 'account' | 'phone' | 'app-download' | 'custom-link' | 'custom-button';
  label: string;
  loggedInLabel?: string;
  icon?: string;
  url?: string;
  badge?: string;
  showBadge?: boolean;
  enabled: boolean;
  displayMode?: 'icon-and-label' | 'icon-only' | 'label-only';
  variant?: 'pill' | 'solid' | 'outline' | 'ghost';
  openInNewTab?: boolean;

  // Particular individual styles
  color?: string;
  bgColor?: string;
  borderColor?: string;
  fontSize?: string;
  fontWeight?: string;
  badgeBg?: string;
  badgeColor?: string;
  borderRadius?: string;
}

export interface HeaderConfig {
  logoUrl?: string;
  logoAlt?: string;
  logoLink?: string;
  logoHeight?: string;
  logoWidth?: string;
  logoShape?: 'circle' | 'rounded' | 'natural';
  logoBorderWidth?: string;
  logoBorderColor?: string;
  logoGap?: string;
  navGap?: string;
  actionsGap?: string;
  actionItems?: HeaderActionItem[];
  showLocation?: boolean;
  deliveringToLabel?: string;
  defaultLocationText?: string;
  navLinks?: HeaderNavLink[];
  showPhone?: boolean;
  phoneText?: string;
  phoneTel?: string;
  showAppButton?: boolean;
  appButtonText?: string;
  appUpdateText?: string;
  appButtonStyle?: 'pill-outline' | 'solid' | 'soft' | 'hidden';
  showCart?: boolean;
  cartLabel?: string;
  showAccount?: boolean;
  loginLabel?: string;
  accountLabel?: string;
  loginButtonStyle?: 'solid' | 'gradient' | 'outline' | 'pill';
  buttonRadius?: string;
  isSticky?: boolean;
  hasShadow?: boolean;
  shadowStyle?: 'none' | 'soft' | 'modern' | 'deep' | 'glow';
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  hoverColor?: string;
  headerHeight?: 'compact' | 'standard' | 'spacious';
  containerWidth?: string;
  headerRadius?: string;
  enableGlassmorphism?: boolean;
  glassmorphismBlur?: string;
  borderBottomWidth?: string;
  borderBottomColor?: string;
  navFontSize?: string;
  navFontWeight?: string;
  navTextTransform?: 'none' | 'uppercase' | 'capitalize';
  navLetterSpacing?: string;
  navActiveStyle?: 'underline' | 'pill' | 'glow' | 'dot';
  subcatNameFontSize?: string;
  subcatNameFontWeight?: string;
  subcatNameColor?: string;
  subcatDescFontSize?: string;
  subcatDescColor?: string;
  subcatDescFontWeight?: string;
  subcatIconSize?: string;
  subcatHoverBg?: string;
  subcatItemRadius?: string;
  dropdownStyle?: 'light' | 'dark' | 'glass';
  dropdownColumns?: '1' | '2';
}

export interface PromoBannerConfig {
  enabled: boolean;
  text: string;
  badgeText?: string;
  badgeBg?: string;
  badgeColor?: string;
  bgColor?: string;
  bgGradientEnd?: string;
  isGradient?: boolean;
  textColor?: string;
  height?: string;
  fontSize?: string;
  alignment?: 'center' | 'left' | 'right';
  isMarquee?: boolean;
  marqueeSpeed?: 'slow' | 'normal' | 'fast';
  linkUrl?: string;
  closeable?: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, AuthModalComponent],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  isScrolled = false;
  isMenuOpen = false;
  isAuthModalOpen = false;
  isAccountDropdownOpen = false;

  bannerConfig: PromoBannerConfig = (() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem('foodybhai_promo_banner');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        }
      }
    } catch (e) {}
    return {
      enabled: true,
      text: '🎉 Special Offer! Get 20% OFF on all orders today! Use code FOODY20 at checkout! 🎉 🔥',
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
    };
  })();
  isBannerDismissed = false;

  headerConfig: HeaderConfig = (() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem('foodybhai_header_config');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        }
      }
    } catch (e) {}
    return {
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
    };
  })();

  activeDropdownIndex: number | null = null;
  mobileExpandedNavIndices = new Set<number>();
  private dropdownCloseTimer: any = null;

  constructor(
    public cartService: CartService, 
    public locationService: LocationService,
    public authService: AuthService,
    public uiService: UiService,
    public appUpdateService: AppUpdateService,
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadBannerConfig();
    this.loadHeaderConfig();

    this.uiService.authModalOpen$.subscribe(isOpen => {
      this.ngZone.run(() => {
        this.isAuthModalOpen = isOpen;
        this.cdr.detectChanges();
      });
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeAccountDropdown();
      this.closeMenu();
    });
  }

  loadHeaderConfig() {
    this.orderService.getSetting('header_config').subscribe({
      next: (res) => {
        if (res && res.value !== undefined && res.value !== null) {
          try {
            const parsed = typeof res.value === 'string' ? JSON.parse(res.value) : res.value;
            if (parsed && typeof parsed === 'object') {
              this.headerConfig = { ...this.headerConfig, ...parsed };
              try {
                if (typeof localStorage !== 'undefined') {
                  localStorage.setItem('foodybhai_header_config', JSON.stringify(this.headerConfig));
                }
              } catch (e) {}
            }
          } catch {
            if (typeof res.value === 'object') {
              this.headerConfig = { ...this.headerConfig, ...res.value };
              try {
                if (typeof localStorage !== 'undefined') {
                  localStorage.setItem('foodybhai_header_config', JSON.stringify(this.headerConfig));
                }
              } catch (e) {}
            }
          }
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('foodybhai_header_channel');
        ch.onmessage = (ev) => {
          if (ev.data && ev.data.header) {
            this.headerConfig = { ...this.headerConfig, ...ev.data.header };
            try {
              localStorage.setItem('foodybhai_header_config', JSON.stringify(this.headerConfig));
            } catch (e) {}
            this.cdr.detectChanges();
          }
        };
      }
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', (ev) => {
          if (ev.key === 'foodybhai_header_config' && ev.newValue) {
            try {
              this.headerConfig = { ...this.headerConfig, ...JSON.parse(ev.newValue) };
              this.cdr.detectChanges();
            } catch (e) {}
          }
        });
      }
    } catch (e) {}
  }

  loadBannerConfig() {
    // 1. Immediately read from localStorage to avoid any color flash on refresh
    try {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem('foodybhai_promo_banner');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            this.bannerConfig = { ...this.bannerConfig, ...parsed };
          }
        }
      }
    } catch (e) {}

    // 2. Fetch live settings from API
    this.orderService.getSetting('promo_banner').subscribe({
      next: (res) => {
        if (res && res.value !== undefined && res.value !== null) {
          try {
            const parsed = typeof res.value === 'string' ? JSON.parse(res.value) : res.value;
            if (parsed && typeof parsed === 'object') {
              this.bannerConfig = { ...this.bannerConfig, ...parsed };
              try {
                if (typeof localStorage !== 'undefined') {
                  localStorage.setItem('foodybhai_promo_banner', JSON.stringify(this.bannerConfig));
                }
              } catch (e) {}
            }
          } catch {
            if (typeof res.value === 'object') {
              this.bannerConfig = { ...this.bannerConfig, ...res.value };
              try {
                if (typeof localStorage !== 'undefined') {
                  localStorage.setItem('foodybhai_promo_banner', JSON.stringify(this.bannerConfig));
                }
              } catch (e) {}
            }
          }
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });

    // 3. Listen for live updates across tabs
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('foodybhai_banner_channel');
        ch.onmessage = (ev) => {
          if (ev.data && ev.data.banner) {
            this.bannerConfig = { ...this.bannerConfig, ...ev.data.banner };
            try {
              localStorage.setItem('foodybhai_promo_banner', JSON.stringify(this.bannerConfig));
            } catch (e) {}
            this.cdr.detectChanges();
          }
        };
      }
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', (ev) => {
          if (ev.key === 'foodybhai_promo_banner' && ev.newValue) {
            try {
              this.bannerConfig = { ...this.bannerConfig, ...JSON.parse(ev.newValue) };
              this.cdr.detectChanges();
            } catch (e) {}
          }
        });
      }
    } catch (e) {}
  }

  getBannerBackground(): string {
    if (!this.bannerConfig) return '#ea580c';
    if (this.bannerConfig.isGradient !== false && this.bannerConfig.bgGradientEnd) {
      return `linear-gradient(90deg, ${this.bannerConfig.bgColor || '#ea580c'} 0%, ${this.bannerConfig.bgGradientEnd} 100%)`;
    }
    return this.bannerConfig.bgColor || '#ea580c';
  }

  getMarqueeDuration(): string {
    if (!this.bannerConfig) return '24s';
    if (this.bannerConfig.marqueeSpeed === 'slow') return '36s';
    if (this.bannerConfig.marqueeSpeed === 'fast') return '15s';
    return '24s';
  }

  getStaticJustify(): string {
    if (!this.bannerConfig || !this.bannerConfig.alignment) return 'center';
    if (this.bannerConfig.alignment === 'left') return 'flex-start';
    if (this.bannerConfig.alignment === 'right') return 'flex-end';
    return 'center';
  }

  onBannerClick() {
    if (this.bannerConfig?.linkUrl) {
      if (this.bannerConfig.linkUrl.startsWith('http')) {
        window.open(this.bannerConfig.linkUrl, '_blank');
      } else {
        this.router.navigateByUrl(this.bannerConfig.linkUrl);
      }
    }
  }

  dismissBanner(event: MouseEvent) {
    event.stopPropagation();
    this.isBannerDismissed = true;
    this.cdr.detectChanges();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrolled = window.scrollY > 20;
    if (this.isScrolled !== scrolled) {
      this.isScrolled = scrolled;
      this.cdr.detectChanges();
    }
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.isAccountDropdownOpen) {
      if (
        !target.closest('.account-dropdown-wrapper') &&
        !target.closest('.account-nav-wrapper') &&
        !target.closest('.mobile-account-dropdown')
      ) {
        this.closeAccountDropdown();
      }
    }
    if (this.activeDropdownIndex !== null) {
      if (!target.closest('.nav-item-wrap')) {
        this.closeDropdowns();
      }
    }
  }

  @HostListener('document:touchstart', ['$event'])
  onDocumentTouch(event: TouchEvent) {
    const target = event.target as HTMLElement;
    if (this.isAccountDropdownOpen) {
      if (
        !target.closest('.account-dropdown-wrapper') &&
        !target.closest('.account-nav-wrapper') &&
        !target.closest('.mobile-account-dropdown')
      ) {
        this.closeAccountDropdown();
      }
    }
    if (this.activeDropdownIndex !== null) {
      if (!target.closest('.nav-item-wrap')) {
        this.closeDropdowns();
      }
    }
  }

  getVisibleNavLinks(): HeaderNavLink[] {
    return (this.headerConfig?.navLinks || []).filter(l => l.enabled !== false);
  }

  getVisibleActions(): HeaderActionItem[] {
    if (this.headerConfig?.actionItems && Array.isArray(this.headerConfig.actionItems) && this.headerConfig.actionItems.length > 0) {
      return this.headerConfig.actionItems.filter(a => a.enabled !== false);
    }
    // Backward compatibility fallback
    const fallback: HeaderActionItem[] = [];
    if (this.headerConfig?.showPhone !== false && this.headerConfig?.phoneText) {
      fallback.push({
        id: 'phone',
        type: 'phone',
        label: this.headerConfig.phoneText,
        url: 'tel:' + (this.headerConfig.phoneTel || this.headerConfig.phoneText),
        icon: 'fa-solid fa-phone',
        enabled: true,
        displayMode: 'icon-and-label',
        variant: 'ghost'
      });
    }
    if (this.headerConfig?.showAppButton !== false && this.headerConfig?.appButtonStyle !== 'hidden') {
      fallback.push({
        id: 'app-download',
        type: 'app-download',
        label: this.headerConfig?.appButtonText || 'Get App',
        loggedInLabel: this.headerConfig?.appUpdateText || 'Update App',
        icon: 'fa-solid fa-mobile-screen-button',
        enabled: true,
        displayMode: 'icon-and-label',
        variant: 'outline'
      });
    }
    if (this.headerConfig?.showCart !== false) {
      fallback.push({
        id: 'cart',
        type: 'cart',
        label: this.headerConfig?.cartLabel || 'Cart',
        icon: 'fa-solid fa-cart-shopping',
        url: '/cart',
        enabled: true,
        displayMode: 'icon-and-label',
        variant: 'ghost',
        showBadge: true
      });
    }
    if (this.headerConfig?.showAccount !== false) {
      fallback.push({
        id: 'account',
        type: 'account',
        label: this.headerConfig?.loginLabel || 'Login',
        loggedInLabel: this.headerConfig?.accountLabel || 'Account',
        icon: 'fa-solid fa-user',
        url: '/profile',
        enabled: true,
        displayMode: 'icon-and-label',
        variant: 'solid',
        bgColor: '#059669',
        color: '#ffffff'
      });
    }
    return fallback;
  }

  isFontAwesome(icon?: string): boolean {
    if (!icon) return false;
    return icon.includes('fa-') || icon.startsWith('fa');
  }

  getVisibleSubcategories(link: HeaderNavLink): HeaderNavSubItem[] {
    if (link.hasDropdown === false) return [];
    return (link.children || []).filter(s => s.enabled !== false);
  }

  onNavMouseEnter(index: number) {
    if (this.dropdownCloseTimer) {
      clearTimeout(this.dropdownCloseTimer);
      this.dropdownCloseTimer = null;
    }
    const visibleLinks = this.getVisibleNavLinks();
    const link = visibleLinks[index];
    if (link && link.hasDropdown !== false && this.getVisibleSubcategories(link).length > 0) {
      this.activeDropdownIndex = index;
      this.cdr.detectChanges();
    }
  }

  onNavMouseLeave(index: number) {
    this.dropdownCloseTimer = setTimeout(() => {
      if (this.activeDropdownIndex === index) {
        this.activeDropdownIndex = null;
        this.cdr.detectChanges();
      }
    }, 180);
  }

  toggleNavDropdown(index: number, event: Event) {
    const visibleLinks = this.getVisibleNavLinks();
    const link = visibleLinks[index];
    if (link && link.hasDropdown !== false && this.getVisibleSubcategories(link).length > 0) {
      event.preventDefault();
      event.stopPropagation();
      this.activeDropdownIndex = this.activeDropdownIndex === index ? null : index;
      this.cdr.detectChanges();
    }
  }

  toggleMobileNavExpand(index: number, event: Event) {
    event.stopPropagation();
    if (this.mobileExpandedNavIndices.has(index)) {
      this.mobileExpandedNavIndices.delete(index);
    } else {
      this.mobileExpandedNavIndices.add(index);
    }
    this.cdr.detectChanges();
  }

  closeDropdowns() {
    this.activeDropdownIndex = null;
    this.cdr.detectChanges();
  }

  getHeaderPadding(): string {
    const h = this.headerConfig?.headerHeight;
    if (h === 'compact') return '6px 0';
    if (h === 'spacious') return '20px 0';
    return '12px 0';
  }

  getHeaderBoxShadow(): string {
    if (this.headerConfig?.hasShadow === false) return 'none';
    const s = this.headerConfig?.shadowStyle;
    if (s === 'none') return 'none';
    if (s === 'modern') return '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)';
    if (s === 'deep') return '0 20px 30px -8px rgba(0, 0, 0, 0.16)';
    if (s === 'glow') return `0 6px 24px ${this.headerConfig?.accentColor || 'rgba(5, 150, 105, 0.25)'}`;
    return '0 4px 18px -4px rgba(0, 0, 0, 0.07)';
  }

  getHeaderBorderBottom(): string {
    const w = this.headerConfig?.borderBottomWidth || '1px';
    if (w === '0px' || w === 'none') return 'none';
    const c = this.headerConfig?.borderBottomColor || '#f1f5f9';
    return `${w} solid ${c}`;
  }

  getHeaderBackdropFilter(): string {
    if (!this.headerConfig?.enableGlassmorphism) return 'none';
    const b = this.headerConfig?.glassmorphismBlur || '12px';
    return `blur(${b})`;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  openCart() {
    this.cartService.openCart();
    this.closeMenu();
  }

  openZomatoStore(){
    window.location.href='https://www.zomato.com/meerut/foody-bhai-mohan-puri/order';
  }
  
  openAuthModal() {
    this.isMenuOpen = false;
    this.closeAccountDropdown();
    this.uiService.openAuthModal();
    this.cdr.detectChanges();
  }

  closeAuthModal() {
    this.uiService.closeAuthModal();
    this.cdr.detectChanges();
  }
  
  toggleAccountDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.isAccountDropdownOpen = !this.isAccountDropdownOpen;
  }

  closeAccountDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isAccountDropdownOpen = false;
  }

  logout() {
    this.authService.logout();
    this.closeAccountDropdown();
    this.closeMenu();
  }
}

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
      text: '🎉 Special Offer! Get 20% OFF on all orders today! Use code FOODY30 at checkout! 🎉 🔥',
      badgeText: 'SPECIAL OFFER',
      badgeBg: '#fae8ff',
      badgeColor: '#7e22ce',
      bgColor: '#6d28d9',
      bgGradientEnd: '#9333ea',
      isGradient: true,
      textColor: '#ffffff',
      height: '48px',
      fontSize: '12px',
      alignment: 'center',
      isMarquee: true,
      marqueeSpeed: 'slow',
      linkUrl: '/menu',
      closeable: false
    };
  })();
  isBannerDismissed = false;

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
    if (!this.isAccountDropdownOpen) return;
    const target = event.target as HTMLElement;
    if (
      !target.closest('.account-dropdown-wrapper') &&
      !target.closest('.account-nav-wrapper') &&
      !target.closest('.mobile-account-dropdown')
    ) {
      this.closeAccountDropdown();
    }
  }

  @HostListener('document:touchstart', ['$event'])
  onDocumentTouch(event: TouchEvent) {
    if (!this.isAccountDropdownOpen) return;
    const target = event.target as HTMLElement;
    if (
      !target.closest('.account-dropdown-wrapper') &&
      !target.closest('.account-nav-wrapper') &&
      !target.closest('.mobile-account-dropdown')
    ) {
      this.closeAccountDropdown();
    }
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

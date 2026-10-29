import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

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
  logoUrl: string;
  logoAlt: string;
  logoLink: string;
  logoHeight?: string;
  logoWidth?: string;
  logoShape?: 'circle' | 'rounded' | 'natural';
  logoBorderWidth?: string;
  logoBorderColor?: string;
  logoGap?: string;
  navGap?: string;
  actionsGap?: string;
  actionItems?: HeaderActionItem[];
  showLocation: boolean;
  deliveringToLabel: string;
  defaultLocationText: string;
  navLinks: HeaderNavLink[];
  showPhone: boolean;
  phoneText: string;
  phoneTel: string;
  showAppButton: boolean;
  appButtonText: string;
  appUpdateText: string;
  appButtonStyle?: 'pill-outline' | 'solid' | 'soft' | 'hidden';
  showCart: boolean;
  cartLabel: string;
  showAccount: boolean;
  loginLabel: string;
  accountLabel: string;
  loginButtonStyle?: 'solid' | 'gradient' | 'outline' | 'pill';
  buttonRadius?: string;
  isSticky: boolean;
  hasShadow: boolean;
  shadowStyle?: 'none' | 'soft' | 'modern' | 'deep' | 'glow';
  bgColor: string;
  textColor: string;
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

export interface FooterConfig {
  tagline: string;
  aboutText: string;
  phone: string;
  email: string;
  address: string;
  copyrightText: string;
  showSocial: boolean;
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
}

export const DEFAULT_HEADER_ACTION_ITEMS: HeaderActionItem[] = [
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
];

const DEFAULT_HEADER_CONFIG: HeaderConfig = {
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
  actionItems: DEFAULT_HEADER_ACTION_ITEMS,
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

const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  tagline: 'Ghar jaisa swaad, har baar!',
  aboutText: "Meerut's favourite cloud kitchen delivering fresh, hygienic, and authentic home-style food right to your doorstep.",
  phone: '+91 8218870579',
  email: 'contact@foodybhai.in',
  address: '226 Bhatwara, Budhana Gate, Meerut, Uttar Pradesh 250002',
  copyrightText: '© 2026 Foody Bhai. All rights reserved.',
  showSocial: true,
  instagramUrl: 'https://instagram.com',
  facebookUrl: 'https://facebook.com',
  twitterUrl: 'https://twitter.com'
};

@Component({
  selector: 'app-header-footer-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header-footer-manager.component.html',
  styleUrl: './header-footer-manager.component.css'
})
export class HeaderFooterManagerComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  activeTab: 'header' | 'footer' = 'header';
  previewMode: 'desktop' | 'mobile' = 'desktop';

  // Subcategories drawer / modal state in admin
  expandedSubcatIndex: number | null = null;

  // Particular styling drawers
  expandedLinkStyleIndex: number | null = null;
  expandedSubcatStyleKey: string | null = null; // "linkIdx-subIdx"

  // Interactive preview dropdown index
  previewDropdownIndex: number | null = null;

  // Header Actions style drawer state
  expandedActionStyleIndex: number | null = null;

  toggleActionStyle(index: number) {
    this.expandedActionStyleIndex = this.expandedActionStyleIndex === index ? null : index;
  }

  addActionItem(type: 'cart' | 'account' | 'phone' | 'app-download' | 'custom-link' | 'custom-button' = 'custom-link') {
    if (!this.headerConfig.actionItems) {
      this.headerConfig.actionItems = [];
    }

    const id = 'action_' + Date.now();
    let newItem: HeaderActionItem;

    if (type === 'cart') {
      newItem = {
        id,
        type: 'cart',
        label: 'Cart',
        icon: 'fa-solid fa-cart-shopping',
        url: '/cart',
        enabled: true,
        displayMode: 'icon-and-label',
        variant: 'ghost',
        showBadge: true
      };
    } else if (type === 'account') {
      newItem = {
        id,
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
      };
    } else if (type === 'phone') {
      newItem = {
        id,
        type: 'phone',
        label: '+91 8218870579',
        icon: 'fa-solid fa-phone',
        url: 'tel:8218870579',
        enabled: true,
        displayMode: 'icon-and-label',
        variant: 'ghost',
        fontSize: '13.5px',
        fontWeight: '600'
      };
    } else if (type === 'app-download') {
      newItem = {
        id,
        type: 'app-download',
        label: 'Get App',
        loggedInLabel: 'Update App',
        icon: 'fa-solid fa-mobile-screen-button',
        url: '/download-app',
        enabled: true,
        displayMode: 'icon-and-label',
        variant: 'outline',
        borderRadius: '24px'
      };
    } else {
      newItem = {
        id,
        type: 'custom-link',
        label: 'New Action',
        icon: 'fa-solid fa-tag',
        url: '/menu',
        enabled: true,
        displayMode: 'icon-and-label',
        variant: 'ghost',
        fontSize: '13.5px',
        fontWeight: '600'
      };
    }

    this.headerConfig.actionItems.push(newItem);
    this.expandedActionStyleIndex = this.headerConfig.actionItems.length - 1;
  }

  removeActionItem(index: number) {
    if (this.headerConfig.actionItems) {
      this.headerConfig.actionItems.splice(index, 1);
      if (this.expandedActionStyleIndex === index) {
        this.expandedActionStyleIndex = null;
      }
    }
  }

  moveActionItem(index: number, direction: 'up' | 'down') {
    if (!this.headerConfig.actionItems) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= this.headerConfig.actionItems.length) return;
    const temp = this.headerConfig.actionItems[index];
    this.headerConfig.actionItems[index] = this.headerConfig.actionItems[targetIndex];
    this.headerConfig.actionItems[targetIndex] = temp;
    if (this.expandedActionStyleIndex === index) {
      this.expandedActionStyleIndex = targetIndex;
    }
  }

  getVisibleActionItems(): HeaderActionItem[] {
    return (this.headerConfig?.actionItems || []).filter(a => a.enabled !== false);
  }

  isFontAwesome(icon?: string): boolean {
    if (!icon) return false;
    return icon.includes('fa-') || icon.startsWith('fa');
  }

  toggleLinkStyle(index: number) {
    this.expandedLinkStyleIndex = this.expandedLinkStyleIndex === index ? null : index;
  }

  toggleSubcatStyle(linkIndex: number, subIndex: number) {
    const key = `${linkIndex}-${subIndex}`;
    this.expandedSubcatStyleKey = this.expandedSubcatStyleKey === key ? null : key;
  }

  isSubcatStyleOpen(linkIndex: number, subIndex: number): boolean {
    return this.expandedSubcatStyleKey === `${linkIndex}-${subIndex}`;
  }

  headerConfig: HeaderConfig = JSON.parse(JSON.stringify(DEFAULT_HEADER_CONFIG));
  footerConfig: FooterConfig = JSON.parse(JSON.stringify(DEFAULT_FOOTER_CONFIG));

  isLoading = false;
  isSaving = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // Broadcast channel for sync with open frontend tabs
  private headerChannel: BroadcastChannel | null = null;
  private footerChannel: BroadcastChannel | null = null;

  ngOnInit() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.headerChannel = new BroadcastChannel('foodybhai_header_channel');
      this.footerChannel = new BroadcastChannel('foodybhai_footer_channel');
    }
    this.loadAllSettings();
  }

  loadAllSettings() {
    this.isLoading = true;

    // Load header config
    this.api.getSetting('header_config').subscribe({
      next: (res) => {
        if (res && res.value !== undefined && res.value !== null) {
          try {
            const parsed = typeof res.value === 'string' ? JSON.parse(res.value) : res.value;
            if (parsed && typeof parsed === 'object') {
              this.headerConfig = { ...DEFAULT_HEADER_CONFIG, ...parsed };
              if (!Array.isArray(this.headerConfig.navLinks)) {
                this.headerConfig.navLinks = [...DEFAULT_HEADER_CONFIG.navLinks];
              }
              if (!Array.isArray(this.headerConfig.actionItems) || this.headerConfig.actionItems.length === 0) {
                this.headerConfig.actionItems = JSON.parse(JSON.stringify(DEFAULT_HEADER_ACTION_ITEMS));
              }
            }
          } catch (e) {
            console.error('Error parsing header_config:', e);
          }
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    // Load footer config
    this.api.getSetting('footer_config').subscribe({
      next: (res) => {
        if (res && res.value !== undefined && res.value !== null) {
          try {
            const parsed = typeof res.value === 'string' ? JSON.parse(res.value) : res.value;
            if (parsed && typeof parsed === 'object') {
              this.footerConfig = { ...DEFAULT_FOOTER_CONFIG, ...parsed };
            }
          } catch (e) {
            console.error('Error parsing footer_config:', e);
          }
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  saveHeaderSettings() {
    this.isSaving = true;
    this.api.saveSetting('header_config', this.headerConfig).subscribe({
      next: () => {
        this.isSaving = false;
        this.showToast('✅ Header settings saved and published successfully!', 'success');

        // Broadcast to live frontend clients
        try {
          if (this.headerChannel) {
            this.headerChannel.postMessage({ type: 'HEADER_CONFIG_UPDATED', config: this.headerConfig });
          }
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('foodybhai_header_config', JSON.stringify(this.headerConfig));
          }
        } catch (e) {}

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSaving = false;
        this.showToast('❌ Failed to save header settings. Please try again.', 'error');
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  saveFooterSettings() {
    this.isSaving = true;
    this.api.saveSetting('footer_config', this.footerConfig).subscribe({
      next: () => {
        this.isSaving = false;
        this.showToast('✅ Footer settings saved and published successfully!', 'success');

        try {
          if (this.footerChannel) {
            this.footerChannel.postMessage({ type: 'FOOTER_CONFIG_UPDATED', config: this.footerConfig });
          }
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('foodybhai_footer_config', JSON.stringify(this.footerConfig));
          }
        } catch (e) {}

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSaving = false;
        this.showToast('❌ Failed to save footer settings. Please try again.', 'error');
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  resetHeaderDefaults() {
    if (confirm('Reset header settings to default FoodyBhai values? Any unsaved edits will be discarded.')) {
      this.headerConfig = JSON.parse(JSON.stringify(DEFAULT_HEADER_CONFIG));
      this.saveHeaderSettings();
    }
  }

  resetFooterDefaults() {
    if (confirm('Reset footer settings to default values? Any unsaved edits will be discarded.')) {
      this.footerConfig = JSON.parse(JSON.stringify(DEFAULT_FOOTER_CONFIG));
      this.saveFooterSettings();
    }
  }

  addNavLink() {
    if (!this.headerConfig.navLinks) {
      this.headerConfig.navLinks = [];
    }
    this.headerConfig.navLinks.push({
      label: 'New Link',
      url: '/menu',
      exact: false,
      enabled: true,
      hasDropdown: false,
      children: []
    });
  }

  removeNavLink(index: number) {
    if (this.headerConfig.navLinks && this.headerConfig.navLinks.length > 1) {
      this.headerConfig.navLinks.splice(index, 1);
      if (this.expandedSubcatIndex === index) {
        this.expandedSubcatIndex = null;
      }
    } else {
      this.showToast('At least one navigation link is recommended.', 'error');
    }
  }

  moveNavLink(index: number, direction: 'up' | 'down') {
    if (!this.headerConfig.navLinks) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= this.headerConfig.navLinks.length) return;
    const temp = this.headerConfig.navLinks[index];
    this.headerConfig.navLinks[index] = this.headerConfig.navLinks[targetIndex];
    this.headerConfig.navLinks[targetIndex] = temp;
    if (this.expandedSubcatIndex === index) {
      this.expandedSubcatIndex = targetIndex;
    }
  }

  getVisibleNavLinks(): HeaderNavLink[] {
    return (this.headerConfig?.navLinks || []).filter(l => l.enabled !== false);
  }

  getVisibleSubcategories(link: HeaderNavLink): HeaderNavSubItem[] {
    if (link.hasDropdown === false) return [];
    return (link.children || []).filter(s => s.enabled !== false);
  }

  // --- Subcategories Management ---
  toggleSubcategories(index: number) {
    const link = this.headerConfig.navLinks[index];
    if (!link.children) {
      link.children = [];
    }
    this.expandedSubcatIndex = this.expandedSubcatIndex === index ? null : index;
  }

  addSubcategory(linkIndex: number) {
    const link = this.headerConfig.navLinks[linkIndex];
    if (!link.children) {
      link.children = [];
    }
    link.children.push({
      label: 'New Subcategory',
      url: '/menu?cat=new',
      icon: '🍲',
      description: 'Fresh and authentic dishes',
      enabled: true
    });
    link.hasDropdown = true;
  }

  removeSubcategory(linkIndex: number, subIndex: number) {
    const link = this.headerConfig.navLinks[linkIndex];
    if (link?.children) {
      link.children.splice(subIndex, 1);
      if (link.children.length === 0) {
        link.hasDropdown = false;
      }
    }
  }

  quickAddPopularSubcategories(linkIndex: number) {
    const link = this.headerConfig.navLinks[linkIndex];
    link.children = [
      { label: 'All Dishes', url: '/menu', icon: '🍽️', description: 'Explore full menu', enabled: true },
      { label: 'Main Course & Curries', url: '/menu?cat=main-course', icon: '🍛', description: 'Paneer, Dal Makhani & rich gravies', badge: 'POPULAR', enabled: true },
      { label: 'Breads & Rice', url: '/menu?cat=breads-rice', icon: '🫓', description: 'Tandoori roti, butter naan & biryani', enabled: true },
      { label: 'Snacks & Starters', url: '/menu?cat=snacks', icon: '🥟', description: 'Crispy samosas & rolls', enabled: true },
      { label: 'Desserts & Sweets', url: '/menu?cat=desserts', icon: '🍨', description: 'Gulab jamun & rasmalai', badge: 'SWEET', enabled: true }
    ];
    link.hasDropdown = true;
    this.showToast('✅ Added 5 popular subcategories to "' + link.label + '"', 'success');
  }

  // --- Live Preview Helper ---
  togglePreviewDropdown(index: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const visibleLinks = this.getVisibleNavLinks();
    const link = visibleLinks[index];
    if (link && link.hasDropdown !== false && this.getVisibleSubcategories(link).length > 0) {
      this.previewDropdownIndex = this.previewDropdownIndex === index ? null : index;
    }
  }

  getPreviewPadding(): string {
    const h = this.headerConfig?.headerHeight;
    if (h === 'compact') return '6px 18px';
    if (h === 'spacious') return '20px 24px';
    return '12px 24px';
  }

  getPreviewBoxShadow(): string {
    if (this.headerConfig?.hasShadow === false) return 'none';
    const s = this.headerConfig?.shadowStyle;
    if (s === 'none') return 'none';
    if (s === 'modern') return '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)';
    if (s === 'deep') return '0 20px 30px -8px rgba(0, 0, 0, 0.16)';
    if (s === 'glow') return `0 6px 24px ${this.headerConfig?.accentColor || 'rgba(5, 150, 105, 0.25)'}`;
    return '0 4px 18px -4px rgba(0, 0, 0, 0.07)';
  }

  getPreviewBorderBottom(): string {
    const w = this.headerConfig?.borderBottomWidth || '1px';
    if (w === '0px' || w === 'none') return 'none';
    const c = this.headerConfig?.borderBottomColor || '#f1f5f9';
    return `${w} solid ${c}`;
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => {
      if (this.toastMessage === msg) {
        this.toastMessage = '';
      }
    }, 4000);
  }
}

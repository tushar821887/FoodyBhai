
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

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FilterStatusPipe } from '../../pipes/filter-status.pipe';
import { FormsModule } from '@angular/forms';
import { ApiService, Order } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { Router, ActivatedRoute, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { RichEditorComponent } from '../../components/rich-editor/rich-editor.component';
import { ThemeManagerComponent } from '../../components/theme-manager/theme-manager.component';
import { PageBuilderComponent } from '../../components/page-builder/page-builder.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FilterStatusPipe, RichEditorComponent, ThemeManagerComponent, PageBuilderComponent],
  templateUrl: './orders.page.html',
  styleUrl: './orders.page.css'
})
export class OrdersPage implements OnInit, OnDestroy {
  notifiedOrderIds = new Set<string>();
  notifiedCancelResolutions = new Set<string>();
  notifiedReassignOrderIds = new Set<string>();
  notifiedAgentReassignResolutions = new Set<string>();
  knownOrderIds = new Set<string>();
  isFirstLoad = true;
  private eventSource: EventSource | null = null;
  private notificationSub: any = null;

  // Permission Prompt Banner
  showNotificationPermissionPrompt = false;
  notificationPermissionState: 'granted' | 'denied' | 'prompt' = 'prompt';
  showNotificationBlockedGuideModal = false;

  // Agent Reassignment Request Modal
  showReassignModal = false;
  orderToRequestReassign: any = null;
  reassignReason = '';
  quickReassignReasons: string[] = [
    'Vehicle breakdown / puncture',
    'Emergency / personal reason',
    'Customer location outside delivery range',
    'Extreme traffic delay / order pending too long',
    'Severe weather / rain conditions',
    'Battery low / phone issue'
  ];

  // Admin Reassignment Approval Modal
  showApproveReassignModal = false;
  orderToReassignAdmin: any = null;
  selectedReassignAgent: any = null;
  
  getMapUrl(order: any) {
    const origin = encodeURIComponent('127, Bhatwara, Meerut - 250002');
    let destStr = order.deliveryDetails?.address || '';
    if (!destStr.toLowerCase().includes('meerut')) destStr += ', Meerut, Uttar Pradesh, India';
    const destination = encodeURIComponent(destStr);
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  }
  currentUser: any = null;
  isAgent = false;

  confirmDialog = {
    show: false,
    title: '',
    message: '',
    icon: 'â“',
    onConfirm: () => {},
    onCancel: () => {}
  };

  showConfirm(title: string, message: string, icon: string = 'â“'): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmDialog = {
        show: true,
        title,
        message,
        icon,
        onConfirm: () => {
          this.confirmDialog.show = false;
          resolve(true);
        },
        onCancel: () => {
          this.confirmDialog.show = false;
          resolve(false);
        }
      };
    });
  }
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  baseOrders: Order[] = [];
  contacts: any[] = [];
  currentTab: string = 'pending';
  currentView: 'dashboard' | 'history' | 'agents' | 'settings' | 'menu' | 'users' | 'payments' | 'cancel-requests' | 'contacts' | 'theme' | 'cms' | 'coupons' | 'banner' = 'dashboard';
  menuTab: 'categories' | 'items' | 'mapping' = 'categories';

  promoBanner: PromoBannerConfig = {
    enabled: true,
    text: 'ðŸŽ‰ Special Offer! Get 20% OFF on all orders today! Use code FOODY20 at checkout! ðŸŽ‰',
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
  isSavingBanner = false;

  mobileMenuOpen = false;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
  
  showCancelModal = false;
  cancelReason = '';
  orderToCancel: string | null = null;

  categories: any[] = [];
  recipes: any[] = [];
  restaurantStats: any = { averageRating: 0, totalReviews: 0 };
  
  // Menu Category Form
  newCategoryName = '';
  newCategoryDesc = '';
  newCategoryIcon = '';
  newCategoryImg = '';

  presetIcons = [
    { label: 'PopCorn', icon: 'ðŸ¿', type: 'emoji' },
    { label: 'Thali & Meals', icon: 'fa-solid fa-utensils', type: 'fa' },
    { label: 'Rice & Biryani', icon: 'fa-solid fa-bowl-rice', type: 'fa' },
    { label: 'Puri & Sabzi', icon: 'fa-solid fa-plate-wheat', type: 'fa' },
    { label: 'Main Course', icon: 'fa-solid fa-bowl-food', type: 'fa' },
    { label: 'Snacks', icon: 'fa-solid fa-cookie-bite', type: 'fa' },
    { label: 'Drinks & Beverages', icon: 'fa-solid fa-glass-water', type: 'fa' },
    { label: 'Hot Tea / Coffee', icon: 'fa-solid fa-mug-hot', type: 'fa' },
    { label: 'Fresh Salad', icon: 'fa-solid fa-leaf', type: 'fa' },
    { label: 'Raita & Sides', icon: 'fa-solid fa-spoon', type: 'fa' },
    { label: 'Special Combos', icon: 'fa-solid fa-fire-flame-curved', type: 'fa' },
    { label: 'Burger', icon: 'fa-solid fa-burger', type: 'fa' },
    { label: 'Pizza', icon: 'fa-solid fa-pizza-slice', type: 'fa' },
    { label: 'Ice Cream & Sweets', icon: 'fa-solid fa-ice-cream', type: 'fa' },
    { label: 'Cake & Bakery', icon: 'fa-solid fa-cake-candles', type: 'fa' },
    { label: 'Essentials & Grocery', icon: 'fa-solid fa-basket-shopping', type: 'fa' },
  ];
  
  // Menu Item Form
  newItem: any = {
    title: '',
    slug: '',
    price: 0,
    category: '',
    description: '',
    image: '',
    isVeg: true,
    inStock: true,
    ingredientsRaw: '',
    recipeHtml: '',
    ingredients: []
  };
  
  // Mapping
  selectedMappingCategory = '';
  
  // Edit State
  editingCategory: any = null;
  
  editingRecipe: any = null;
  showEditRecipeModal = false;
  
  users: any[] = [];
  editingUser: any = null;
  showAddUserModal = false;
  newUser: any = { name: '', email: '', password: '', phone: '', role: 'user' };
  showEditUserModal = false;
  agents: any[] = [];
  showAddAgentModal = false;
  newAgentName = '';
  newAgentPhone = '';
  newAgentEmail = '';
  newAgentPassword = '';
  isAddingAgent = false;
  
  // Settings
  activeSettingsTab: 'payment' | 'billing' | 'app' | 'smtp' | 'notifications' = 'payment';

  setSettingsTab(tab: 'payment' | 'billing' | 'app' | 'smtp' | 'notifications') {
    this.activeSettingsTab = tab;
    this.cdr.detectChanges();
  }

  upiId: string = '';
  restaurantOpen = true;
  restaurantClosedReason = 'We are currently closed. Please check back later.';
  qrImageUrl: string = '';
  selectedQrMode: 'dynamic' | 'uploaded' = 'dynamic';

  // Taxes, Platform Fee & Delivery Fee Settings
  gstPercent: number = 5;
  platformFee: number = 5;
  deliveryFee: number = 0;
  freeDeliveryMinAmount: number = 0;

  // Website Cart Offers Widget Configuration
  cartOffersConfig: {
    enabled: boolean;
    title: string;
    subtitle: string;
    buttonText: string;
    displayMode: 'popup' | 'chips' | 'both';
    maxOffersToShow: number;
  } = {
    enabled: true,
    title: 'Available Offers',
    subtitle: 'Tap to view coupons & deals',
    buttonText: 'View Offers',
    displayMode: 'popup',
    maxOffersToShow: 5
  };

  // App Release Settings
  appVersion: string = '1.0.0';
  appDownloadUrl: string = '/downloads/foodybhai.apk';
  appReleaseNotes: string = 'Bug fixes, performance improvements, and real-time live order tracking.';
  isUploadingApk = false;
  uploadedApkFileName = '';

  // Email (SMTP) & SMS Settings
  smtpHost: string = '';
  showSmtpPassword = false;
  isTestingSmtp = false;
  smtpTestResult: { success?: boolean; message?: string } | null = null;
  smtpPort: string = '587';
  smtpUser: string = '';
  smtpPass: string = '';
  smtpFrom: string = '';
  fast2smsKey: string = '';

  get effectiveUpiId(): string {
    return this.upiId || '8218870579@ptyes';
  }

  get hasCustomUploadedQr(): boolean {
    return !!(this.qrImageUrl && !this.qrImageUrl.includes('wikimedia.org'));
  }

  getUpiPaymentString(amount?: number): string {
    const upi = this.effectiveUpiId;
    const amt = Number(amount || this.orderToDeliver?.totalAmount || 0).toFixed(2);
    return `upi://pay?pa=${upi}&pn=FoodyBhai&am=${amt}&cu=INR&tn=FoodyBhaiOrder`;
  }

  getDynamicQrUrl(amount?: number): string {
    const upiStr = this.getUpiPaymentString(amount);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiStr)}`;
  }

  copyUpiId() {
    const upi = this.effectiveUpiId;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(upi).then(() => {
        this.showNotification('UPI ID copied: ' + upi, 'success');
      }).catch(() => {
        this.showNotification('UPI ID: ' + upi, 'success');
      });
    } else {
      this.showNotification('UPI ID: ' + upi, 'success');
    }
  }

  // Payment Modal
  showPaymentModal = false;
  orderToDeliver: any = null;
  selectedPaymentMethod: 'cod' | 'online' = 'cod';
  cashReceived: boolean = false;
  showAssignModal = false;
  selectedAgent: any = null;
  orderToAssign: string | null = null;
  
  prepTimeInput: number = 15;
  selectedOrderId: string | null = null;
  showPrepModal = false;

  private pollInterval: any;
  isFetchingOrders = false;
  isFetchingStats = false;
  private ringAudio: HTMLAudioElement | null = null;
  private isRinging = false;
  private manuallySilenced = false;

  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.notificationMessage = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  private mapUrlCache = new Map<string, any>();

  getEmbeddedMapUrl(address: string) {
    if (!address) return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    if (this.mapUrlCache.has(address)) {
      return this.mapUrlCache.get(address);
    }
    
    let searchAddress = address;
    if (!searchAddress.toLowerCase().includes('meerut')) {
      searchAddress += ', Meerut, Uttar Pradesh, India';
    }
    
    // Embed a route from restaurant to the user
    const origin = encodeURIComponent('127, Bhatwara, Meerut - 250002');
    const dest = encodeURIComponent(searchAddress);
    const url = `https://maps.google.com/maps?saddr=${origin}&daddr=${dest}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.mapUrlCache.set(address, safeUrl);
    return safeUrl;
  }

  private timerInterval: any;

  ngOnInit() {
    this.currentUser = this.api.getCurrentUser();
    if (this.currentUser && this.currentUser.role === 'agent') {
      this.isAgent = true;
      this.currentTab = 'out_for_delivery';
    }

    // Check if notification permission is needed
    this.checkNotificationPermission();

    this.syncViewFromRoute();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.syncViewFromRoute();
    });

    this.route.queryParams.subscribe((params: any) => {
      if (params['tab'] && (params['tab'] === 'categories' || params['tab'] === 'items' || params['tab'] === 'mapping')) {
        this.menuTab = params['tab'];
        this.cdr.detectChanges();
      }
      if (params['tab'] && ['payment', 'billing', 'app', 'smtp', 'notifications'].includes(params['tab'])) {
        this.activeSettingsTab = params['tab'];
        this.cdr.detectChanges();
      }
    });

    // When user taps a standard Android notification, bring app to front and navigate to order
    this.notificationSub = this.notificationService.notificationAction$.subscribe((extra) => {
      console.log('App opened via notification click:', extra);
      this.stopRinging();
      this.currentView = 'dashboard';
      if (this.isAgent) {
        this.currentTab = 'out_for_delivery';
      } else {
        this.currentTab = 'pending';
      }
      this.fetchOrders();
      this.cdr.detectChanges();
    });

    // Connect to instant real-time order stream (SSE)
    this.connectToLiveOrderStream();

    this.api.getSetting('restaurant_open').subscribe(res => { if (res && res.value !== undefined) this.restaurantOpen = res.value === 'true' || res.value === true; });
    this.api.getSetting('foodybhai_upi').subscribe(res => { if (res && res.value !== undefined) this.upiId = res.value; });
    this.api.getSetting('foodybhai_qr').subscribe(res => { if (res && res.value !== undefined) this.qrImageUrl = res.value; });
    this.api.getSetting('app_version').subscribe(res => { if (res && res.value) this.appVersion = res.value; });
    this.api.getSetting('app_download_url').subscribe(res => { if (res && res.value) this.appDownloadUrl = res.value; });
    this.api.getSetting('app_release_notes').subscribe(res => { if (res && res.value) this.appReleaseNotes = res.value; });
    this.api.getSetting('smtp_host').subscribe(res => { if (res && res.value) this.smtpHost = res.value; });
    this.api.getSetting('smtp_port').subscribe(res => { if (res && res.value) this.smtpPort = res.value; });
    this.api.getSetting('smtp_user').subscribe(res => { if (res && res.value) this.smtpUser = res.value; });
    this.api.getSetting('smtp_pass').subscribe(res => { if (res && res.value) this.smtpPass = res.value; });
    this.api.getSetting('smtp_from').subscribe(res => { if (res && res.value) this.smtpFrom = res.value; });
    this.api.getSetting('fast2sms_api_key').subscribe(res => { if (res && res.value) this.fast2smsKey = res.value; });
    this.api.getSetting('tax_gst_percent').subscribe(res => { if (res && res.value !== undefined) this.gstPercent = Number(res.value) || 0; });
    this.api.getSetting('platform_fee').subscribe(res => { if (res && res.value !== undefined) this.platformFee = Number(res.value) || 0; });
    this.api.getSetting('delivery_fee').subscribe(res => { if (res && res.value !== undefined) this.deliveryFee = Number(res.value) || 0; });
    this.api.getSetting('free_delivery_min_amount').subscribe(res => { if (res && res.value !== undefined) this.freeDeliveryMinAmount = Number(res.value) || 0; });
    this.api.getSetting('cart_offers_config').subscribe(res => {
      if (res && res.value !== undefined && res.value !== null) {
        try {
          const val = typeof res.value === 'string' ? JSON.parse(res.value) : res.value;
          this.cartOffersConfig = {
            enabled: val.enabled !== undefined ? Boolean(val.enabled) : true,
            title: val.title || 'Available Offers',
            subtitle: val.subtitle || 'Tap to view coupons & deals',
            buttonText: val.buttonText || 'View Offers',
            displayMode: val.displayMode || 'popup',
            maxOffersToShow: Number(val.maxOffersToShow) || 5
          };
        } catch (e) {}
      }
    });
    this.fetchOrders();
    this.fetchRestaurantStats();

    // Background polling fallback for orders (every 20s, only when on order-relevant views)
    this.pollInterval = setInterval(() => {
      if (this.currentView === 'dashboard' || this.currentView === 'history' || this.currentView === 'cancel-requests') {
        this.fetchOrders();
      }
    }, 20000);

    // Only run preparation countdown timer change detection if viewing dashboard with active preparing orders
    this.timerInterval = setInterval(() => {
      if (this.currentView === 'dashboard' && this.orders && this.orders.some(o => o.status === 'preparing' && o.preparationTime)) {
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  async checkNotificationPermission() {
    this.notificationPermissionState = await this.notificationService.checkPermission();
    const alreadyHandled = typeof window !== 'undefined' ? 
      (localStorage.getItem('foodybhai_notif_permission_handled') || localStorage.getItem('notif_banner_dismissed')) : null;

    if (this.notificationPermissionState === 'granted') {
      // Permission is already active; never show prompt banner
      this.showNotificationPermissionPrompt = false;
      if (typeof window !== 'undefined') {
        localStorage.setItem('foodybhai_notif_permission_handled', 'true');
        localStorage.setItem('foodybhai_notif_permission_status', 'granted');
        // Quietly unlock audio context on very first user tap anywhere
        const unlockAudioOnGesture = () => {
          this.notificationService.unlockAudio();
          document.removeEventListener('click', unlockAudioOnGesture);
          document.removeEventListener('touchstart', unlockAudioOnGesture);
        };
        document.addEventListener('click', unlockAudioOnGesture, { once: true, passive: true });
        document.addEventListener('touchstart', unlockAudioOnGesture, { once: true, passive: true });
      }
    } else if (alreadyHandled) {
      // User has already responded previously (Allow or Don't Allow); never ask again
      this.showNotificationPermissionPrompt = false;
    } else {
      // First time only: ask the user
      this.showNotificationPermissionPrompt = true;
    }
    this.cdr.detectChanges();
  }

  async allowNotifications() {
    // Permanently remember that the user has been prompted so it never asks again
    if (typeof window !== 'undefined') {
      localStorage.setItem('foodybhai_notif_permission_handled', 'true');
    }
    this.showNotificationPermissionPrompt = false;
    this.notificationService.unlockAudio();

    const currentState = await this.notificationService.checkPermission();
    if (currentState === 'denied') {
      this.notificationPermissionState = 'denied';
      this.showNotificationBlockedGuideModal = true;
      this.showNotification('Sound alarm is ready. Notifications are blocked in browser settings (see instructions).', 'error');
      this.cdr.detectChanges();
      return;
    }

    const granted = await this.notificationService.requestPermission();
    if (granted) {
      this.notificationPermissionState = 'granted';
      if (typeof window !== 'undefined') {
        localStorage.setItem('foodybhai_notif_permission_status', 'granted');
      }
      this.showNotification('ðŸ”” Notifications & sound alerts enabled!', 'success');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([200, 100, 200]); } catch(e) {}
      }
    } else {
      this.notificationPermissionState = 'denied';
      this.showNotificationBlockedGuideModal = true;
      this.showNotification('Notifications were blocked in your browser. Please allow them via the address bar.', 'error');
    }
    this.cdr.detectChanges();
  }

  async handleNotificationAction() {
    if (this.notificationPermissionState === 'granted') {
      this.testNotificationAndSound();
      return;
    }
    await this.allowNotifications();
  }

  testNotificationAndSound() {
    this.notificationService.unlockAudio();
    this.notificationService.startRinging();
    setTimeout(() => this.notificationService.stopRinging(), 2500);
    this.notificationService.sendNotification({
      title: 'ðŸ”” Test Alert - FoodyBhai',
      body: 'Notifications and sound alarms are working perfectly!'
    });
    this.showNotification('ðŸ”” Sound alarm & test notification triggered!', 'success');
  }

  async recheckPermissionAfterUnblock() {
    const state = await this.notificationService.checkPermission();
    this.notificationPermissionState = state;
    if (state === 'granted') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('foodybhai_notif_permission_handled', 'true');
        localStorage.setItem('foodybhai_notif_permission_status', 'granted');
      }
      this.showNotificationBlockedGuideModal = false;
      this.showNotificationPermissionPrompt = false;
      this.showNotification('âœ… Notifications & sound alerts are now active!', 'success');
      this.notificationService.sendNotification({
        title: 'ðŸ”” FoodyBhai Alerts Active',
        body: 'You will now receive instant notifications when orders arrive!'
      });
    } else {
      this.showNotification('Still blocked. Please toggle Notifications to Allow in the address bar (ðŸ”’ icon), then re-check.', 'error');
    }
    this.cdr.detectChanges();
  }

  denyNotifications() {
    this.showNotificationPermissionPrompt = false;
    if (typeof window !== 'undefined') {
      // Permanently remember that user dismissed it so they are never nagged again
      localStorage.setItem('foodybhai_notif_permission_handled', 'true');
      localStorage.setItem('foodybhai_notif_permission_status', 'denied');
      localStorage.setItem('notif_banner_dismissed', 'true');
    }
    this.showNotification('Notifications paused. You can enable them anytime from Settings.', 'error');
    this.cdr.detectChanges();
  }

  connectToLiveOrderStream() {
    try {
      this.eventSource = this.api.getOrderEventSource();
      if (this.eventSource) {
        this.eventSource.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            console.log('âš¡ Instant live order event received:', payload);
            if (payload && payload.type === 'new_order') {
              this.manuallySilenced = false;
            }
            // Instant fetch to keep orders synced
            this.fetchOrders();
          } catch (e) {
            console.error('Failed to parse SSE live payload:', e);
          }
        };
        this.eventSource.onerror = (err) => {
          console.warn('SSE live order stream reconnecting...', err);
        };
      }
    } catch (e) {
      console.warn('Could not initialize EventSource stream:', e);
    }
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.eventSource) this.eventSource.close();
    if (this.notificationSub) this.notificationSub.unsubscribe();
    this.stopRinging();
  }

  getPreparationTimeRemaining(order: any): string {
    if (order.status !== 'preparing' || !order.preparationTime) return '';
    const startTime = new Date(order.updatedAt || order.createdAt).getTime();
    const targetTime = startTime + order.preparationTime * 60000;
    const now = new Date().getTime();
    const diff = targetTime - now;
    if (diff <= 0) return 'Overdue / Ready!';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  fetchOrders(force = false) {
    if (this.isFetchingOrders && !force) return;
    this.isFetchingOrders = true;

    this.api.getAllOrders().subscribe({
      next: (data) => {
        this.isFetchingOrders = false;
        const pendingOrders = data.filter(o => o.status === 'pending');
        const pendingCount = pendingOrders.length;
        
        if (!this.isAgent) {
          if (pendingCount === 0) {
            this.manuallySilenced = false;
            if (this.notificationService.isCurrentlyRinging()) {
              this.stopRinging();
            }
          } else if (pendingCount > 0 && !this.manuallySilenced && !this.notificationService.isCurrentlyRinging()) {
            this.startRinging();
          }
        }
        
        this.orders = data;
        this.baseOrders = this.orders;
        if (this.isAgent) {
           this.baseOrders = this.orders.filter(o => o.deliveryAgent && (o.deliveryAgent?.phone === this.currentUser.phone));
        }
        this.filterOrders();
        
        if (this.isAgent) {
           const myOrders = data.filter(o => o.status === 'out_for_delivery' && o.deliveryAgent && o.deliveryAgent?.phone === this.currentUser.phone);
           myOrders.forEach(o => {
             if (!this.notifiedOrderIds.has(o._id)) {
               this.notifiedOrderIds.add(o._id);
               const shortId = o._id.slice(-6).toUpperCase();
               const address = o.deliveryDetails?.address || 'Customer Location';
               this.notificationService.sendNotification({
                 title: `ðŸ›µ Delivery Assigned: #${shortId}!`,
                 body: `Deliver to ${address}. Tap to open route & details.`,
                 data: { orderId: o._id, ...o }
               });
               this.showNotification(`ðŸ›µ Delivery #${shortId} assigned to you!`, 'success');
             }
           });

           const myResolvedCancels = data.filter(o => o.deliveryAgent && o.deliveryAgent?.phone === this.currentUser.phone && o.cancelRequest && o.cancelRequest.status !== 'pending');
           myResolvedCancels.forEach(o => {
             const key = o._id + '-' + o.cancelRequest?.status;
             if (!this.notifiedCancelResolutions.has(key)) {
               this.notifiedCancelResolutions.add(key);
               const resolution = o.cancelRequest?.status === 'approved' ? 'Approved' : 'Rejected';
               const shortId = o._id.slice(-6).toUpperCase();
               this.notificationService.sendNotification({
                 title: `Cancel Request ${resolution}!`,
                 body: `Your cancellation request for Order #${shortId} was ${resolution.toLowerCase()}.`,
                 data: { orderId: o._id, ...o }
               });
             }
           });

           const myResolvedReassigns = data.filter(o => o.reassignRequest && o.reassignRequest.status !== 'pending' && (
             (o.deliveryAgent && o.deliveryAgent.phone === this.currentUser.phone) ||
             (o.reassignRequest.requestedByAgent && o.reassignRequest.requestedByAgent.phone === this.currentUser.phone)
           ));
           myResolvedReassigns.forEach(o => {
             const key = o._id + '-reassign-' + o.reassignRequest?.status;
             if (!this.notifiedAgentReassignResolutions.has(key)) {
               this.notifiedAgentReassignResolutions.add(key);
               const res = o.reassignRequest?.status === 'approved' ? 'Approved' : 'Rejected';
               const shortId = o._id.slice(-6).toUpperCase();
               this.showNotification(`Reassign request for Order #${shortId} was ${res.toLowerCase()}.`, res === 'Approved' ? 'success' : 'error');
               this.notificationService.sendNotification({
                 title: `Reassign Request ${res}!`,
                 body: `Your reassignment request for Order #${shortId} was ${res.toLowerCase()}.`,
                 data: { orderId: o._id, ...o }
               });
             }
           });
        } else {
           // --- ADMIN NOTIFICATIONS ---
           // 1. Detect New Incoming Pending Orders (Trigger once per new order; rings until accepted)
           if (!this.isFirstLoad) {
             const newPendingOrders = pendingOrders.filter(o => !this.knownOrderIds.has(o._id));
             newPendingOrders.forEach(o => {
               this.manuallySilenced = false;
               const shortId = o._id.slice(-6).toUpperCase();
               const custName = o.deliveryDetails?.name || 'Customer';
               const amount = o.totalAmount ? `â‚¹${o.totalAmount}` : '';
               const itemsCount = o.items ? `${o.items.length} item(s)` : '';
               
               this.notificationService.sendNotification({
                 title: `ðŸ”” NEW ORDER #${shortId} (${amount})!`,
                 body: `${custName} ordered ${itemsCount}. Tap to view and accept order.`,
                 data: { orderId: o._id, ...o }
               });
               this.showNotification(`ðŸ”” New Order #${shortId} received (${amount})!`, 'success');
               if (!this.notificationService.isCurrentlyRinging()) {
                 this.startRinging();
               }
             });
           }

           // 2. Detect Pending Agent Reassignment Requests (Toast notification only, DO NOT trigger sound/ring)
           const pendingReassignOrders = data.filter(o => o.reassignRequest && o.reassignRequest.status === 'pending');
           pendingReassignOrders.forEach(o => {
             if (!this.notifiedReassignOrderIds.has(o._id)) {
               this.notifiedReassignOrderIds.add(o._id);
               const agentName = o.reassignRequest?.requestedByAgent?.name || o.deliveryAgent?.name || 'Agent';
               const shortId = o._id.slice(-6).toUpperCase();
               this.showNotification(`âš ï¸ Agent ${agentName} requested reassignment for Order #${shortId}! Reason: ${o.reassignRequest?.reason}`, 'error');
             }
           });
        }

        // Track all known orders
        data.forEach(o => this.knownOrderIds.add(o._id));
        this.isFirstLoad = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isFetchingOrders = false;
        console.error('Failed to fetch orders', err);
        this.cdr.detectChanges();
      }
    });
  }

  fetchRestaurantStats() {
    if (this.isFetchingStats) return;
    this.isFetchingStats = true;
    this.api.getRestaurantStats().subscribe({
      next: (stats: any) => {
        this.isFetchingStats = false;
        this.restaurantStats = stats;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isFetchingStats = false;
        console.error('Failed to fetch stats', err);
      }
    });
  }

  startRinging() {
    this.isRinging = true;
    this.notificationService.startRinging();
  }

  stopRinging(silenceUserAction: boolean = false) {
    if (silenceUserAction) {
      this.manuallySilenced = true;
    }
    this.isRinging = false;
    this.notificationService.stopRinging();
  }

  get isRingingActive(): boolean {
    return this.notificationService.isCurrentlyRinging();
  }

  setTab(tab: string) {
    this.currentTab = tab;
    this.filterOrders();
  }

  get activeOrdersCount() {
    let baseOrders = this.baseOrders;
    return baseOrders.filter(o => ['preparing', 'ready', 'out_for_delivery'].includes(o.status)).length;
  }

  // Dashboard History Filters
  dashboardHistoryDate: string = 'all';
  dashboardHistoryPayment: string = 'all';

  filterOrders() {
    let baseOrders = this.orders;
    if (this.isAgent) {
       baseOrders = this.orders.filter(o => o.deliveryAgent && (o.deliveryAgent?.phone === this.currentUser.phone));
    }
    
    if (this.currentTab === 'pending') {
      this.filteredOrders = baseOrders.filter(o => o.status === 'pending');
    } else if (this.currentTab === 'preparing') {
      this.filteredOrders = baseOrders.filter(o => o.status === 'preparing');
    } else if (this.currentTab === 'ready') {
      this.filteredOrders = baseOrders.filter(o => o.status === 'ready');
    } else if (this.currentTab === 'out_for_delivery') {
      this.filteredOrders = baseOrders.filter(o => o.status === 'out_for_delivery');
    } else if (this.currentTab === 'cancelled') {
      this.filteredOrders = baseOrders.filter(o => ['cancelled', 'rejected'].includes(o.status));
    } else {
      let historyOrders = baseOrders.filter(o => o.status === 'delivered');
      
      if (this.dashboardHistoryDate !== 'all') {
        const now = new Date();
        historyOrders = historyOrders.filter(o => {
          if (!o.createdAt) return true;
          const orderDate = new Date(o.createdAt);
          const diffDays = Math.ceil(Math.abs(now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)); 
          if (this.dashboardHistoryDate === 'today') return diffDays <= 1;
          if (this.dashboardHistoryDate === 'weekly') return diffDays <= 7;
          if (this.dashboardHistoryDate === 'monthly') return diffDays <= 30;
          return true;
        });
      }

      if (this.dashboardHistoryPayment !== 'all') {
        historyOrders = historyOrders.filter(o => {
          const p = (o.paymentMethod || '').toLowerCase();
          if (this.dashboardHistoryPayment === 'online') return p === 'online';
          if (this.dashboardHistoryPayment === 'cod') return p === 'cod';
          return true;
        });
      }
      
      this.filteredOrders = historyOrders;
    }
  }

  
  
  // Order History Features
  historyFilterDate: string = 'all';
  historyFilterStatus: string = 'all';
  historyFilterPayment: string = 'all';
  historyFilterAgent: string = 'all';
  showOrderDetailsModal: boolean = false;
  selectedHistoryOrder: any = null;

  get filteredHistoryOrders() {
    let result = this.baseOrders;

    // Date Filter
    if (this.historyFilterDate !== 'all') {
      const now = new Date();
      result = result.filter(o => {
        if (!o.createdAt) return true;
        const orderDate = new Date(o.createdAt);
        const diffTime = Math.abs(now.getTime() - orderDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (this.historyFilterDate === 'weekly') return diffDays <= 7;
        if (this.historyFilterDate === 'monthly') return diffDays <= 30;
        return true;
      });
    }

    // Status Filter
    if (this.historyFilterStatus !== 'all') {
      result = result.filter(o => {
        const s = (o.status || '').toLowerCase();
        if (this.historyFilterStatus === 'completed') return s === 'delivered' || s === 'completed';
        if (this.historyFilterStatus === 'cancelled') return s === 'cancelled' || s === 'rejected';
        return true;
      });
    }

    // Payment Filter
    if (this.historyFilterAgent !== 'all') {
      result = result.filter(o => o.deliveryAgent && o.deliveryAgent?.phone === this.historyFilterAgent);
    }

    if (this.historyFilterPayment !== 'all') {
      result = result.filter(o => {
        const p = (o.paymentMethod || '').toLowerCase();
        if (this.historyFilterPayment === 'online') return p === 'online';
        if (this.historyFilterPayment === 'cod') return p === 'cod';
        return true;
      });
    }

    return result;
  }

  get filteredHistoryTotalAmount() {
    return this.filteredHistoryOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  }

  // --- PAYMENTS VIEW LOGIC ---
  paymentFilterDate: string = 'all';
  paymentFilterMethod: string = 'all';

  get filteredPaymentOrders() {
    let result = this.baseOrders.filter(o => o.status === 'delivered');

    if (this.paymentFilterDate !== 'all') {
      const now = new Date();
      result = result.filter(o => {
        const orderDate = new Date(o.createdAt);
        if (this.paymentFilterDate === 'weekly') {
          return (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24) <= 7;
        } else if (this.paymentFilterDate === 'monthly') {
          return (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24) <= 30;
        }
        return true;
      });
    }

    if (this.paymentFilterMethod !== 'all') {
      result = result.filter(o => (o.paymentMethod || '').toLowerCase() === this.paymentFilterMethod);
    }
    return result;
  }

  get totalRevenue() {
    return this.filteredPaymentOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  get onlineRevenue() {
    return this.filteredPaymentOrders.filter(o => (o.paymentMethod || '').toLowerCase() === 'online').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  get codRevenue() {
    return this.filteredPaymentOrders.filter(o => (o.paymentMethod || '').toLowerCase() !== 'online').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

    get agentCashBalances() {
    const balances: { agentName: string, phone: string, cashCollected: number, deliveries: number }[] = [];
    const codOrders = this.filteredPaymentOrders.filter(o => (o.paymentMethod || '').toLowerCase() !== 'online' && o.deliveryAgent && o.deliveryAgent.phone);
    
    codOrders.forEach(o => {
      const agentPhone = o.deliveryAgent!.phone || 'unknown';
      const agentName = o.deliveryAgent!.name || 'Unknown Agent';
      
      let existingIndex = balances.findIndex(b => b.phone === agentPhone);
      if (existingIndex === -1) {
        balances.push({ agentName: agentName, phone: agentPhone, cashCollected: 0, deliveries: 0 });
        existingIndex = balances.length - 1;
      }
      
      balances[existingIndex].cashCollected += (o.totalAmount || 0);
      balances[existingIndex].deliveries += 1;
    });
    
    return balances.sort((a, b) => b.cashCollected - a.cashCollected);
  }


  
  openCouponOrderDetails(couponOrder: any) {
    const found = this.baseOrders.find(o => o._id === couponOrder.orderId || o._id === couponOrder._id);
    if (found) {
      this.selectedHistoryOrder = found;
    } else {
      this.selectedHistoryOrder = {
        _id: couponOrder.orderId || couponOrder._id,
        items: couponOrder.items || [],
        totalAmount: couponOrder.totalAmount,
        discount: couponOrder.discount,
        couponCode: couponOrder.couponCode,
        deliveryDetails: couponOrder.customer,
        status: couponOrder.status,
        orderType: couponOrder.orderType,
        paymentMethod: couponOrder.paymentMethod,
        paymentStatus: couponOrder.paymentStatus,
        createdAt: couponOrder.createdAt
      };
    }
    this.showOrderDetailsModal = true;
    this.cdr.detectChanges();
  }

  openHistoryDetails(order: any) {
    this.selectedHistoryOrder = order;
    this.showOrderDetailsModal = true;
  }

  getCustomerPhone(order: any): string | null {
    if (!order) return null;
    const rawDelPhone = order.deliveryDetails?.phone || order.customer?.phone;
    if (rawDelPhone && typeof rawDelPhone === 'string' && !rawDelPhone.includes('@') && rawDelPhone.trim() !== '') {
      return rawDelPhone.trim();
    }
    const rawUserPhone = order.userId?.phone;
    if (rawUserPhone && typeof rawUserPhone === 'string' && !rawUserPhone.includes('@') && rawUserPhone.trim() !== '') {
      return rawUserPhone.trim();
    }
    return null;
  }

  getCustomerEmail(order: any): string | null {
    if (!order) return null;
    const email = order.deliveryDetails?.email || order.customer?.email;
    if (email && typeof email === 'string' && email.includes('@') && email.trim() !== '' && email !== 'N/A') {
      return email.trim();
    }
    const rawDelPhone = order.deliveryDetails?.phone || order.customer?.phone;
    if (rawDelPhone && typeof rawDelPhone === 'string' && rawDelPhone.includes('@') && rawDelPhone.trim() !== '') {
      return rawDelPhone.trim();
    }
    const userEmail = order.userId?.email;
    if (userEmail && typeof userEmail === 'string' && userEmail.includes('@') && userEmail.trim() !== '' && userEmail !== 'N/A') {
      return userEmail.trim();
    }
    return null;
  }

  syncViewFromRoute() {
    const dataView = this.route.snapshot.data?.['view'];
    let path = dataView || this.route.snapshot.routeConfig?.path;
    if (!path) {
      path = this.router.url.split('?')[0].replace(/^\//, '');
    }
    const validViews: Array<'dashboard' | 'history' | 'agents' | 'settings' | 'menu' | 'users' | 'payments' | 'cancel-requests' | 'contacts' | 'theme' | 'cms' | 'coupons' | 'banner'> = [
      'dashboard', 'history', 'agents', 'settings', 'menu', 'users', 'payments', 'cancel-requests', 'contacts', 'theme', 'cms', 'coupons', 'banner'
    ];
    let matchedView = validViews.find(v => v === path);
    if (!matchedView) {
      if (path === '' || path === 'orders') {
        matchedView = 'dashboard';
      }
    }
    if (matchedView) {
      if (matchedView !== this.currentView) {
        this.setView(matchedView, false);
      } else {
        this.loadViewData(matchedView);
      }
    }
  }

  setView(view: 'dashboard' | 'history' | 'agents' | 'settings' | 'menu' | 'users' | 'payments' | 'cancel-requests' | 'contacts' | 'theme' | 'cms' | 'coupons' | 'banner', updateRoute: boolean = true) {
    this.currentView = view;
    this.closeMobileMenu();
    if (updateRoute) {
      const targetPath = view === 'dashboard' ? '/dashboard' : '/' + view;
      if (this.router.url.split('?')[0] !== targetPath) {
        this.router.navigate([targetPath], { queryParamsHandling: 'preserve' });
      }
    }
    this.loadViewData(view);
    this.cdr.detectChanges();
  }

  loadViewData(view: string) {
    if (view === 'banner' || view === 'settings') {
      this.loadPromoBannerSettings();
    }
    if (view === 'coupons') {
      this.loadCoupons();
      this.loadCouponStats();
      this.loadCouponOrders(this.selectedCouponFilter === 'all' ? undefined : this.selectedCouponFilter);
    }
    if (view === 'dashboard') {
      this.fetchOrders();
      this.fetchRestaurantStats();
    }
    if (view === 'history') {
      this.fetchOrders(true);
    }
    if ((view === 'history' || view === 'payments') && this.agents.length === 0) { this.fetchAgents(); }
    if (view === 'menu') {
      this.fetchCategories();
      this.fetchRecipes();
    }
    if (view === 'contacts') {
      this.api.getContacts().subscribe(res => {
        this.contacts = res;
        this.cdr.detectChanges();
      });
    }
    if (view === 'settings') {
      this.api.getSetting('foodybhai_upi').subscribe(res => { if (res && res.value !== undefined) this.upiId = res.value; });
      this.api.getSetting('foodybhai_qr').subscribe(res => { if (res && res.value !== undefined) this.qrImageUrl = res.value; });
      this.api.getSetting('restaurant_open').subscribe(res => { if (res && res.value !== undefined) this.restaurantOpen = res.value === 'true' || res.value === true; });
      this.api.getSetting('restaurant_closed_reason').subscribe(res => { if (res && res.value !== undefined) this.restaurantClosedReason = res.value; });
      this.api.getSetting('app_version').subscribe(res => { if (res && res.value) this.appVersion = res.value; });
      this.api.getSetting('app_download_url').subscribe(res => { if (res && res.value) this.appDownloadUrl = res.value; });
      this.api.getSetting('app_release_notes').subscribe(res => { if (res && res.value) this.appReleaseNotes = res.value; });
      this.api.getSetting('tax_gst_percent').subscribe(res => { if (res && res.value !== undefined) this.gstPercent = Number(res.value) || 0; });
      this.api.getSetting('platform_fee').subscribe(res => { if (res && res.value !== undefined) this.platformFee = Number(res.value) || 0; });
      this.api.getSetting('smtp_host').subscribe(res => { if (res && res.value) this.smtpHost = res.value; });
      this.api.getSetting('smtp_port').subscribe(res => { if (res && res.value) this.smtpPort = res.value; });
      this.api.getSetting('smtp_user').subscribe(res => { if (res && res.value) this.smtpUser = res.value; });
      this.api.getSetting('smtp_pass').subscribe(res => { if (res && res.value) this.smtpPass = res.value; });
      this.api.getSetting('smtp_from').subscribe(res => { if (res && res.value) this.smtpFrom = res.value; });
      this.api.getSetting('fast2sms_api_key').subscribe(res => { if (res && res.value) this.fast2smsKey = res.value; });
    this.api.getSetting('tax_gst_percent').subscribe(res => { if (res && res.value !== undefined) this.gstPercent = Number(res.value) || 0; });
    this.api.getSetting('platform_fee').subscribe(res => { if (res && res.value !== undefined) this.platformFee = Number(res.value) || 0; });
    this.api.getSetting('delivery_fee').subscribe(res => { if (res && res.value !== undefined) this.deliveryFee = Number(res.value) || 0; });
    this.api.getSetting('free_delivery_min_amount').subscribe(res => { if (res && res.value !== undefined) this.freeDeliveryMinAmount = Number(res.value) || 0; });
    this.api.getSetting('cart_offers_config').subscribe(res => {
      if (res && res.value !== undefined && res.value !== null) {
        try {
          const val = typeof res.value === 'string' ? JSON.parse(res.value) : res.value;
          this.cartOffersConfig = {
            enabled: val.enabled !== undefined ? Boolean(val.enabled) : true,
            title: val.title || 'Available Offers',
            subtitle: val.subtitle || 'Tap to view coupons & deals',
            buttonText: val.buttonText || 'View Offers',
            displayMode: val.displayMode || 'popup',
            maxOffersToShow: Number(val.maxOffersToShow) || 5
          };
        } catch (e) {}
      }
    });
    }
    if (view === 'agents') {
      this.fetchAgents();
    }
    if (view === 'users') {
      this.fetchUsers();
    }
  }

  fetchUsers() {
    this.api.getUsers().subscribe(data => {
      this.users = data;
      this.cdr.detectChanges();
    });
  }

  addUser() {
    if(!this.newUser.name || !this.newUser.email || !this.newUser.password) {
      this.showNotification('Name, Email, and Password are required', 'error');
      return;
    }
    this.api.createUser(this.newUser).subscribe({
      next: () => {
        this.showAddUserModal = false;
        this.newUser = { name: '', email: '', password: '', phone: '', role: 'user' };
        this.fetchUsers();
      },
      error: (err) => this.showNotification(err.error?.message || 'Failed to create user', 'error')
    });
  }

  editUser(user: any) {
    this.editingUser = { ...user, password: '' };
    this.showEditUserModal = true;
  }

  saveUserEdit() {
    if(!this.editingUser) return;
    const updateData: any = {
      name: this.editingUser.name,
      email: this.editingUser.email,
      phone: this.editingUser.phone,
      role: this.editingUser.role
    };
    if (this.editingUser.password) {
      updateData.password = this.editingUser.password;
    }
    
    this.api.updateUser(this.editingUser._id || this.editingUser.id, updateData).subscribe(() => {
      this.showEditUserModal = false;
      this.editingUser = null;
      this.fetchUsers();
    });
  }

  async deleteUser(id: string) {
    if(await this.showConfirm('Delete User', 'Delete this user?')) {
      this.api.deleteUser(id).subscribe(() => this.fetchUsers());
    }
  }

  fetchAgents() {
    this.api.getAgents().subscribe(data => this.agents = data);
  }

  openAddAgentModal() {
    this.newAgentName = '';
    this.newAgentPhone = '';
    this.newAgentEmail = '';
    this.newAgentPassword = '';
    this.showAddAgentModal = true;
  }

  closeAddAgentModal() {
    this.showAddAgentModal = false;
    this.newAgentName = '';
    this.newAgentPhone = '';
    this.newAgentEmail = '';
    this.newAgentPassword = '';
  }

  addAgent() {
    if(!this.newAgentName.trim() || !this.newAgentPhone.trim()) {
      this.showNotification('Agent Name and Phone Number are required', 'error');
      return;
    }
    this.isAddingAgent = true;
    this.api.addAgent(this.newAgentName.trim(), this.newAgentPhone.trim(), this.newAgentEmail.trim(), this.newAgentPassword.trim()).subscribe({
      next: () => {
        this.closeAddAgentModal();
        this.isAddingAgent = false;
        this.showNotification('Delivery partner added successfully!', 'success');
        this.fetchAgents();
      },
      error: (err) => {
        this.isAddingAgent = false;
        this.showNotification(err.error?.message || 'Failed to add delivery agent', 'error');
      }
    });
  }

  editingAgent: any = null;
  showEditAgentModal = false;

  editAgent(agent: any) {
    this.editingAgent = { ...agent, password: '' };
    this.showEditAgentModal = true;
  }

  saveAgentEdit() {
    if(!this.editingAgent) return;
    this.api.updateAgent(
      this.editingAgent._id || this.editingAgent.id,
      this.editingAgent.name,
      this.editingAgent.phone,
      this.editingAgent.email,
      this.editingAgent.password
    ).subscribe(() => {
      this.showEditAgentModal = false;
      this.editingAgent = null;
      this.fetchAgents();
    });
  }

  async deleteAgent(id: string) {
    if(await this.showConfirm('Delete Agent', 'Delete this agent?')) {
      this.api.deleteAgent(id).subscribe(() => this.fetchAgents());
    }
  }

  toggleAgentStatus(agent: any) {
    const newStatus = agent.isActive === false ? true : false;
    this.api.updateAgentStatus(agent.id || agent._id, newStatus).subscribe(() => {
      agent.isActive = newStatus;
      this.showNotification(`Agent marked as ${newStatus ? 'Active' : 'Inactive'}`, 'success');
      this.fetchAgents();
    });
  }

  getActiveAgents() {
    return this.agents.filter(a => a.isActive !== false);
  }

  
  openAssignAgentModal(orderId: string) {
    this.orderToAssign = orderId;
    this.selectedAgent = null;
    this.showAssignModal = true;
    if (this.agents.length === 0) {
      this.fetchAgents();
    }
  }

  assignAgent(agent: any) {
    this.selectedAgent = agent;
  }

  confirmOutForDelivery() {
    if (!this.orderToAssign || !this.selectedAgent) return;
    this.api.updateOrderStatus(this.orderToAssign, 'out_for_delivery', undefined, {
      name: this.selectedAgent.name,
      phone: this.selectedAgent.phone
    }).subscribe(() => {
      this.showAssignModal = false;
      this.fetchOrders();
      this.showNotification(`Agent assigned. Customer notified!`, 'success');
    });
  }

  
  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.qrImageUrl = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  
  setMenuTab(tab: 'categories' | 'items' | 'mapping') {
    this.menuTab = tab;
  }

  fetchCategories() {
    this.api.getCategories().subscribe(res => this.categories = res);
  }

  selectPresetIcon(iconStr: string, isEdit = false) {
    if (isEdit && this.editingCategory) {
      this.editingCategory.icon = iconStr;
      this.editingCategory.image = '';
    } else {
      this.newCategoryIcon = iconStr;
      this.newCategoryImg = '';
    }
  }

  onCategoryIconFileSelected(event: any, isEdit = false) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (isEdit && this.editingCategory) {
        this.editingCategory.image = base64;
      } else {
        this.newCategoryImg = base64;
      }
    };
    reader.readAsDataURL(file);
  }

  isEmoji(str?: string): boolean {
    if (!str) return false;
    return !str.includes('fa-') && str.length <= 4;
  }

  addCategory() {
    if(!this.newCategoryName) {
      this.showNotification('Please enter Category Name', 'error');
      return;
    }
    this.api.addCategory(this.newCategoryName, this.newCategoryDesc, this.newCategoryIcon, this.newCategoryImg).subscribe({
      next: () => {
        this.newCategoryName = '';
        this.newCategoryDesc = '';
        this.newCategoryIcon = '';
        this.newCategoryImg = '';
        this.fetchCategories();
        this.showNotification('Category created successfully!', 'success');
      },
      error: (err) => {
        this.showNotification(err.error?.message || 'Failed to create category', 'error');
      }
    });
  }

  editCategory(cat: any) {
    this.editingCategory = { ...cat };
  }

  saveCategoryEdit() {
    if(!this.editingCategory) return;
    this.api.updateCategory(
      this.editingCategory.id, 
      this.editingCategory.name, 
      this.editingCategory.description,
      this.editingCategory.icon,
      this.editingCategory.image
    ).subscribe({
      next: () => {
        this.editingCategory = null;
        this.fetchCategories();
        this.showNotification('Category updated successfully!', 'success');
      },
      error: (err) => {
        this.showNotification(err.error?.message || 'Failed to update category', 'error');
      }
    });
  }

  getItemCount(categoryName: string): number {
    return this.recipes.filter(r => r.category === categoryName).length;
  }

  async deleteCategory(id: string) {
    if(await this.showConfirm('Delete Category', 'Delete this category?')) {
      this.api.deleteCategory(id).subscribe(() => this.fetchCategories());
    }
  }

  fetchRecipes() {
    this.api.getRecipes().subscribe(res => this.recipes = res);
  }

  addRecipe() {
    if(!this.newItem.title || !this.newItem.price || !this.newItem.description) {
      this.showNotification('Please fill out Title, Price, and Description', 'error');
      return;
    }
    this.newItem.slug = this.newItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (this.newItem.recipeHtml) {
      const matches = this.newItem.recipeHtml.match(/<li[^>]*>(.*?)<\/li>/gi);
      if (matches && matches.length > 0) {
        this.newItem.ingredients = matches.map((m: string) => m.replace(/<[^>]+>/g, '').trim()).filter((m: string) => m.length > 0);
      }
    }
    this.api.addRecipe(this.newItem).subscribe(() => {
      this.newItem = { title: '', slug: '', price: 0, category: '', description: '', image: '', isVeg: true, inStock: true, recipeHtml: '', ingredients: [] };
      this.fetchRecipes();
      this.showNotification('Item added successfully', 'success');
    });
  }

  editRecipe(recipe: any) {
    let html = recipe.recipeHtml || '';
    this.editingRecipe = {
      ...recipe,
      recipeHtml: html
    };
    this.showEditRecipeModal = true;
  }

  saveRecipeEdit() {
    if(!this.editingRecipe) return;
    if (this.editingRecipe.recipeHtml) {
      const matches = this.editingRecipe.recipeHtml.match(/<li[^>]*>(.*?)<\/li>/gi);
      if (matches && matches.length > 0) {
        this.editingRecipe.ingredients = matches.map((m: string) => m.replace(/<[^>]+>/g, '').trim()).filter((m: string) => m.length > 0);
      }
    }
    this.api.updateRecipe(this.editingRecipe.id || this.editingRecipe._id, this.editingRecipe).subscribe(() => {
      this.showEditRecipeModal = false;
      this.editingRecipe = null;
      this.fetchRecipes();
      this.showNotification('Item updated successfully', 'success');
    });
  }

  async deleteRecipe(id: string) {
    if(await this.showConfirm('Delete Item', 'Delete this item?')) {
      this.api.deleteRecipe(id).subscribe(() => this.fetchRecipes());
    }
  }

  updateRecipeCategory(recipeId: string, newCategory: string) {
    this.api.updateRecipe(recipeId, { category: newCategory }).subscribe(() => {
      this.fetchRecipes();
    });
  }

  toggleStock(recipe: any) {
    const newStock = recipe.inStock === false ? true : false;
    recipe.inStock = newStock;
    this.api.toggleRecipeStock(recipe.id || recipe._id, newStock).subscribe({
      next: (updated) => {
        recipe.inStock = updated.inStock !== false;
        this.showNotification(`"${recipe.title}" is now ${recipe.inStock ? 'In Stock' : 'Out of Stock'}`, 'success');
      },
      error: (err) => {
        recipe.inStock = !newStock;
        this.showNotification('Failed to update stock status', 'error');
      }
    });
  }

  saveSettings(showNotification = true) {
    this.api.saveSetting('foodybhai_upi', this.upiId).subscribe();
    this.api.saveSetting('restaurant_open', this.restaurantOpen ? 'true' : 'false').subscribe();
    if (this.restaurantClosedReason) {
      this.api.saveSetting('restaurant_closed_reason', this.restaurantClosedReason).subscribe();
    }
    this.api.saveSetting('foodybhai_qr', this.qrImageUrl).subscribe(() => {
      if (showNotification) {
        this.showNotification('Settings saved successfully!', 'success');
      }
    });
  }

  saveEmailSettings(showNotification = true) {
    const host = (this.smtpHost || '').trim();
    const port = (this.smtpPort || '').trim() || '465';
    const user = (this.smtpUser || '').trim();
    const pass = (this.smtpPass || '').trim();
    let from = (this.smtpFrom || '').trim();

    if (!from && user) {
      from = `Foody Bhai <${user}>`;
      this.smtpFrom = from;
    }

    this.api.saveSetting('smtp_host', host).subscribe();
    this.api.saveSetting('smtp_port', port).subscribe();
    this.api.saveSetting('smtp_user', user).subscribe();
    this.api.saveSetting('smtp_pass', pass).subscribe();
    this.api.saveSetting('smtp_from', from).subscribe();
    this.api.saveSetting('fast2sms_api_key', (this.fast2smsKey || '').trim()).subscribe(() => {
      if (showNotification) {
        this.showNotification('âœ… Email (SMTP) & SMS Gateway settings saved successfully!', 'success');
      }
      this.cdr.detectChanges();
    });
  }

  testSmtpConnection() {
    this.isTestingSmtp = true;
    this.smtpTestResult = null;
    this.cdr.detectChanges();

    const host = (this.smtpHost || '').trim();
    const port = (this.smtpPort || '').trim() || '465';
    const user = (this.smtpUser || '').trim();
    const pass = (this.smtpPass || '').trim();
    let from = (this.smtpFrom || '').trim();

    if (!from && user) {
      from = `Foody Bhai <${user}>`;
    }

    this.api.testSmtp({
      smtpHost: host,
      smtpPort: port,
      smtpUser: user,
      smtpPass: pass,
      smtpFrom: from,
      targetEmail: user || 'tushar@foodybhai.in'
    }).subscribe({
      next: (res: any) => {
        this.isTestingSmtp = false;
        if (res && res.success) {
          this.smtpTestResult = {
            success: true,
            message: res.message || 'SMTP connected and test email delivered successfully!'
          };
          this.showNotification('âœ… SMTP connection verified! Test email delivered.', 'success');
        } else {
          this.smtpTestResult = {
            success: false,
            message: res.error || 'Failed to authenticate or send email.'
          };
          this.showNotification('âŒ SMTP Test Failed: ' + (res.error || 'Connection error'), 'error');
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isTestingSmtp = false;
        const msg = err.error?.error || err.error?.message || err.message || 'Network error';
        this.smtpTestResult = {
          success: false,
          message: msg
        };
        this.showNotification('âŒ SMTP Test Error: ' + msg, 'error');
        this.cdr.detectChanges();
      }
    });
  }

  saveAppSettings(showNotification = true) {
    this.api.saveSetting('app_version', this.appVersion.trim() || '1.0.0').subscribe();
    this.api.saveSetting('app_download_url', this.appDownloadUrl.trim() || '/downloads/foodybhai.apk').subscribe();
    this.api.saveSetting('app_release_notes', this.appReleaseNotes.trim()).subscribe(() => {
      if (showNotification) {
        this.showNotification(`Android App release settings saved! Users will now see v${this.appVersion}`, 'success');
      }
      this.cdr.detectChanges();
    });
  }

  
  loadPromoBannerSettings() {
    this.api.getSetting('promo_banner').subscribe({
      next: (res) => {
        if (res && res.value !== undefined && res.value !== null) {
          try {
            const parsed = typeof res.value === 'string' ? JSON.parse(res.value) : res.value;
            if (parsed && typeof parsed === 'object') {
              this.promoBanner = { ...this.promoBanner, ...parsed };
            }
          } catch {
            if (typeof res.value === 'object') {
              this.promoBanner = { ...this.promoBanner, ...res.value };
            }
          }
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  savePromoBannerSettings() {
    this.isSavingBanner = true;
    this.api.saveSetting('promo_banner', this.promoBanner).subscribe({
      next: () => {
        this.isSavingBanner = false;
        this.showNotification('ðŸŽ‰ Header Promo Banner settings saved successfully!', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSavingBanner = false;
        this.showNotification('Failed to save banner settings: ' + (err?.error?.message || 'Error'), 'error');
        this.cdr.detectChanges();
      }
    });
  }

  resetPromoBannerSettings() {
    this.promoBanner = {
      enabled: true,
      text: 'ðŸŽ‰ Special Offer! Get 20% OFF on all orders today! Use code FOODY20 at checkout! ðŸŽ‰',
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
    this.showNotification('Reset banner to defaults. Click "Save Banner Settings" to apply.', 'success');
    this.cdr.detectChanges();
  }

  applyBannerPreset(preset: string) {
    switch (preset) {
      case 'orange':
        this.promoBanner.bgColor = '#ea580c';
        this.promoBanner.bgGradientEnd = '#f97316';
        this.promoBanner.isGradient = true;
        this.promoBanner.textColor = '#ffffff';
        this.promoBanner.badgeBg = '#ffffff';
        this.promoBanner.badgeColor = '#ea580c';
        break;
      case 'red':
        this.promoBanner.bgColor = '#b91c1c';
        this.promoBanner.bgGradientEnd = '#ef4444';
        this.promoBanner.isGradient = true;
        this.promoBanner.textColor = '#ffffff';
        this.promoBanner.badgeBg = '#fef2f2';
        this.promoBanner.badgeColor = '#dc2626';
        break;
      case 'dark':
        this.promoBanner.bgColor = '#0f172a';
        this.promoBanner.bgGradientEnd = '#1e293b';
        this.promoBanner.isGradient = true;
        this.promoBanner.textColor = '#fbbf24';
        this.promoBanner.badgeBg = '#fbbf24';
        this.promoBanner.badgeColor = '#0f172a';
        break;
      case 'emerald':
        this.promoBanner.bgColor = '#047857';
        this.promoBanner.bgGradientEnd = '#10b981';
        this.promoBanner.isGradient = true;
        this.promoBanner.textColor = '#ffffff';
        this.promoBanner.badgeBg = '#ffffff';
        this.promoBanner.badgeColor = '#059669';
        break;
      case 'purple':
        this.promoBanner.bgColor = '#6d28d9';
        this.promoBanner.bgGradientEnd = '#9333ea';
        this.promoBanner.isGradient = true;
        this.promoBanner.textColor = '#ffffff';
        this.promoBanner.badgeBg = '#fae8ff';
        this.promoBanner.badgeColor = '#7e22ce';
        break;
      case 'saffron':
        this.promoBanner.bgColor = '#c2410c';
        this.promoBanner.bgGradientEnd = '#f97316';
        this.promoBanner.isGradient = true;
        this.promoBanner.textColor = '#ffffff';
        this.promoBanner.badgeBg = '#ffffff';
        this.promoBanner.badgeColor = '#c2410c';
        break;
    }
    this.cdr.detectChanges();
  }

  insertBannerEmoji(emoji: string) {
    this.promoBanner.text = (this.promoBanner.text || '').trim() + ' ' + emoji + ' ';
    this.cdr.detectChanges();
  }

  getBannerPreviewBackground(): string {
    if (this.promoBanner.isGradient && this.promoBanner.bgGradientEnd) {
      return `linear-gradient(90deg, ${this.promoBanner.bgColor || '#ea580c'} 0%, ${this.promoBanner.bgGradientEnd} 100%)`;
    }
    return this.promoBanner.bgColor || '#ea580c';
  }

  getBannerPreviewDuration(): string {
    if (this.promoBanner.marqueeSpeed === 'slow') return '36s';
    if (this.promoBanner.marqueeSpeed === 'fast') return '15s';
    return '24s';
  }

  saveBillingSettings(showNotification = true) {
    const gstVal = Math.max(0, Number(this.gstPercent) || 0);
    const feeVal = Math.max(0, Number(this.platformFee) || 0);
    const deliveryVal = Math.max(0, Number(this.deliveryFee) || 0);
    const minFreeVal = Math.max(0, Number(this.freeDeliveryMinAmount) || 0);

    this.api.saveSetting('tax_gst_percent', String(gstVal)).subscribe();
    this.api.saveSetting('platform_fee', String(feeVal)).subscribe();
    this.api.saveSetting('delivery_fee', String(deliveryVal)).subscribe();
    this.api.saveSetting('free_delivery_min_amount', String(minFreeVal)).subscribe();
    this.api.saveSetting('cart_offers_config', this.cartOffersConfig).subscribe(() => {
      if (showNotification) {
        this.showNotification(`Billing & Website Cart Offers settings saved successfully!`, 'success');
      }
      this.cdr.detectChanges();
    });
  }

  saveCartOffersConfig() {
    this.saveBillingSettings(true);
  }

  onApkFileSelected(event: any) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.apk')) {
      this.showNotification('Please select a valid .apk file', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('apk', file);
    if (this.appVersion) formData.append('version', this.appVersion.trim());
    if (this.appReleaseNotes) formData.append('releaseNotes', this.appReleaseNotes.trim());

    this.isUploadingApk = true;
    this.uploadedApkFileName = file.name;
    this.cdr.detectChanges();

    this.api.uploadApk(formData).subscribe({
      next: (res: any) => {
        this.isUploadingApk = false;
        this.appDownloadUrl = res.downloadUrl || '/downloads/foodybhai.apk';
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        this.showNotification(`ðŸŽ‰ ${file.name} (${sizeMb} MB) uploaded & published successfully!`, 'success');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isUploadingApk = false;
        this.showNotification(err.error?.message || 'Failed to upload APK file. Please check size.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  openPaymentModal(order: any) {
    this.orderToDeliver = order;
    this.selectedPaymentMethod = order.paymentMethod === 'online' ? 'online' : 'cod';
    this.selectedQrMode = 'dynamic';
    this.cashReceived = false;
    this.showPaymentModal = true;
    this.api.getSetting('foodybhai_upi').subscribe(res => { if (res && res.value !== undefined) this.upiId = res.value; });
    this.api.getSetting('foodybhai_qr').subscribe(res => { if (res && res.value !== undefined) this.qrImageUrl = res.value; });
  }

  confirmDelivery() {
    if (!this.orderToDeliver) return;
    
    // In a real app, we'd also hit an endpoint to update paymentStatus to 'paid'
    // But our updateOrderStatus endpoint currently only accepts status, preparationTime, deliveryAgent.
    // Let's just update the status to delivered. The order is assumed paid if delivered.
    
    this.api.updateOrderStatus(this.orderToDeliver._id, 'delivered').subscribe(() => {
      this.showPaymentModal = false;
      this.fetchOrders();
      this.showNotification(`Order marked delivered. Customer notified!`, 'success');
    });
  }

  logout() {
    this.api.logout();
    window.location.href = '/login';
  }

  openAcceptModal(orderId: string) {
    this.selectedOrderId = orderId;
    this.prepTimeInput = 15;
    this.showPrepModal = true;
  }

  acceptOrder() {
    if (!this.selectedOrderId) return;
    const currentOrderId = this.selectedOrderId;
    const otherPending = this.orders.filter(o => o.status === 'pending' && o._id !== currentOrderId);
    if (otherPending.length === 0) {
      this.manuallySilenced = false;
      this.stopRinging();
    }
    this.api.updateOrderStatus(currentOrderId, 'preparing', this.prepTimeInput).subscribe(() => {
      this.showPrepModal = false;
      this.fetchOrders();
      this.showNotification(`Order accepted & preparing. Customer notified!`, 'success');
    });
  }

  adminRejectOrderId: string | null = null;
  adminRejectReason: string = '';
  showAdminRejectModal = false;

  rejectOrder(orderId: string) {
    this.adminRejectOrderId = orderId;
    this.adminRejectReason = '';
    this.showAdminRejectModal = true;
  }

  confirmAdminReject() {
    if (this.adminRejectOrderId && this.adminRejectReason.trim()) {
      const currentOrderId = this.adminRejectOrderId;
      const otherPending = this.orders.filter(o => o.status === 'pending' && o._id !== currentOrderId);
      if (otherPending.length === 0) {
        this.manuallySilenced = false;
        this.stopRinging();
      }
      this.api.updateOrderStatus(currentOrderId, 'rejected', undefined, undefined, this.adminRejectReason.trim()).subscribe(() => {
        this.showAdminRejectModal = false;
        this.adminRejectOrderId = null;
        this.fetchOrders();
        this.showNotification(`Order cancelled. Customer notified!`, 'error');
      });
    } else {
      this.showNotification('Please provide a reason for cancellation.', 'error');
    }
  }

  openCancelModal(orderId: string) {
    this.orderToCancel = orderId;
    this.cancelReason = '';
    this.showCancelModal = true;
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.orderToCancel = null;
    this.cancelReason = '';
  }

  submitCancelRequest() {
    if (this.orderToCancel && this.cancelReason.trim()) {
      this.api.requestCancelOrder(this.orderToCancel, this.cancelReason.trim()).subscribe(() => {
        this.showNotification('Cancellation request sent to admin.', 'success');
        this.closeCancelModal();
        this.fetchOrders();
      });
    }
  }

  requestCancel(orderId: string) {
    this.openCancelModal(orderId);
  }

  async resolveCancel(order: any, approve: boolean) {
    if (await this.showConfirm('Confirm Action', `Are you sure you want to ${approve ? 'approve' : 'reject'} this cancellation request?`, 'â“')) {
      let processRefund = false;
      if (approve && order.paymentMethod === 'online') {
        processRefund = await this.showConfirm('Refund Order?', `This order was paid online. Do you want to process a refund now?`, 'ðŸ’³');
      }
      this.api.resolveCancelOrder(order._id, approve, processRefund).subscribe(() => {
        this.fetchOrders();
        this.showNotification(`Cancellation ${approve ? 'approved' : 'rejected'}.`, 'success');
      });
    }
  }

  async processRefund(order: any) {
    if (await this.showConfirm('Process Refund', 'Are you sure you want to process the refund for this order?', 'ðŸ’³')) {
      this.api.processRefund(order._id).subscribe(() => {
        this.fetchOrders();
        this.showNotification('Refund processed successfully!', 'success');
      });
    }
  }

  updateStatus(orderId: string, status: string) {
    this.api.updateOrderStatus(orderId, status).subscribe(() => {
      this.fetchOrders();
      let label = status;
      if (status === 'ready') label = 'Ready';
      else if (status === 'out_for_delivery') label = 'Out for Delivery';
      else if (status === 'delivered') label = 'Delivered';
      this.showNotification(`Order marked as ${label}. Customer notified!`, 'success');
    });
  }

  getStatusBadge(status: string) {
    const map: any = {
      pending: { label: 'New', color: '#e74c3c' },
      preparing: { label: 'Preparing', color: '#f39c12' },
      ready: { label: 'Ready', color: '#27ae60' },
      out_for_delivery: { label: 'Out for Delivery', color: '#2980b9' },
      delivered: { label: 'Delivered', color: '#7f8c8d' },
      rejected: { label: 'Rejected', color: '#c0392b' }
    };
    return map[status] || { label: status, color: '#95a5a6' };
  }


  toggleRestaurantStatus() {
    this.saveSettings(false);
  }

  get totalCompletedOrders() {
    return this.filteredOrders.length;
  }

  get totalPayoutAmount() {
    return this.filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  showAgentOrdersModal = false;
  selectedAgentOrders: any[] = [];
  selectedAgentForOrders: any = null;

  viewAgentOrders(agent: any) {
    this.selectedAgentForOrders = agent;
    this.selectedAgentOrders = this.baseOrders.filter(o => o.deliveryAgent && o.deliveryAgent?.phone === agent.phone && o.status === 'delivered');
    this.showAgentOrdersModal = true;
  }

  getAgentDeliveryCount(agentPhone: string): number {
    return this.baseOrders.filter(o => o.deliveryAgent && o.deliveryAgent?.phone === agentPhone && o.status === 'delivered').length;
  }


  // Agent Reassignment Methods
  openReassignModal(order: any) {
    this.orderToRequestReassign = order;
    this.reassignReason = '';
    this.showReassignModal = true;
  }

  closeReassignModal() {
    this.showReassignModal = false;
    this.orderToRequestReassign = null;
    this.reassignReason = '';
  }

  selectQuickReason(reason: string) {
    this.reassignReason = reason;
  }

  submitReassignRequest() {
    if (!this.orderToRequestReassign || !this.reassignReason.trim()) return;
    const agentInfo = {
      name: this.currentUser?.name || this.orderToRequestReassign.deliveryAgent?.name || 'Agent',
      phone: this.currentUser?.phone || this.orderToRequestReassign.deliveryAgent?.phone || ''
    };
    this.api.requestReassignOrder(this.orderToRequestReassign._id, this.reassignReason.trim(), agentInfo).subscribe({
      next: () => {
        this.showNotification('Reassignment request sent to admin.', 'success');
        this.closeReassignModal();
        this.fetchOrders();
      },
      error: (err) => this.showNotification(err.error?.message || 'Failed to submit request', 'error')
    });
  }

  // Admin Reassignment Methods
  openApproveReassignModal(order: any) {
    this.orderToReassignAdmin = order;
    this.selectedReassignAgent = null;
    this.showApproveReassignModal = true;
    if (this.agents.length === 0) {
      this.fetchAgents();
    }
  }

  closeApproveReassignModal() {
    this.showApproveReassignModal = false;
    this.orderToReassignAdmin = null;
    this.selectedReassignAgent = null;
  }

  selectReassignAgent(agent: any) {
    this.selectedReassignAgent = agent;
  }

  confirmApproveReassign() {
    if (!this.orderToReassignAdmin || !this.selectedReassignAgent) return;
    const newAgent = {
      name: this.selectedReassignAgent.name,
      phone: this.selectedReassignAgent.phone
    };
    this.api.resolveReassignOrder(this.orderToReassignAdmin._id, true, newAgent).subscribe({
      next: () => {
        this.showNotification(`Order reassigned to ${newAgent.name}. Fleet and customer updated!`, 'success');
        this.closeApproveReassignModal();
        this.fetchOrders();
      },
      error: (err) => this.showNotification(err.error?.message || 'Failed to reassign agent', 'error')
    });
  }

  async rejectReassign(order: any) {
    const agentName = order.reassignRequest?.requestedByAgent?.name || order.deliveryAgent?.name || 'Agent';
    if (await this.showConfirm('Reject Reassignment', `Reject reassignment request from ${agentName}?`, 'âŒ')) {
      this.api.resolveReassignOrder(order._id, false).subscribe({
        next: () => {
          this.showNotification('Reassignment request rejected.', 'success');
          this.fetchOrders();
        },
        error: (err) => this.showNotification(err.error?.message || 'Failed to reject request', 'error')
      });
    }
  }

  get pendingReassignCount(): number {
    return this.orders.filter(o => o.reassignRequest && o.reassignRequest.status === 'pending').length;
  }

  get totalPendingRequestsCount(): number {
    return this.orders.filter(o => 
      (o.cancelRequest && o.cancelRequest.status === 'pending') || 
      (o.reassignRequest && o.reassignRequest.status === 'pending') ||
      (o.status === 'cancelled' && o.refundStatus === 'pending')
    ).length;
  }

  getCancelAndRefundOrders() {
    return this.baseOrders.filter(o => 
      (o.cancelRequest && o.cancelRequest.status === 'pending') || 
      (o.reassignRequest && o.reassignRequest.status === 'pending') ||
      (o.status === 'cancelled')
    ).sort((a, b) => {
      // Sort pending requests and pending refunds first
      const aNeedsAction = (a.cancelRequest?.status === 'pending') || (a.reassignRequest?.status === 'pending') || (a.status === 'cancelled' && a.refundStatus === 'pending') ? 1 : 0;
      const bNeedsAction = (b.cancelRequest?.status === 'pending') || (b.reassignRequest?.status === 'pending') || (b.status === 'cancelled' && b.refundStatus === 'pending') ? 1 : 0;
      if (aNeedsAction !== bNeedsAction) return bNeedsAction - aNeedsAction;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }


  // --- Coupons & Coupon Tracking State & Methods ---
  coupons: any[] = [];
  couponStats: any = null;
  couponOrders: any[] = [];
  isLoadingCoupons = false;
  isLoadingCouponOrders = false;
  couponTab: 'coupons' | 'tracking' | 'website-cart' = 'coupons';
  selectedCouponFilter: string = 'all';
  couponSearchTerm: string = '';
  couponStatusFilter: 'all' | 'active' | 'inactive' = 'all';
  couponTrackingSearch: string = '';
  showCreateCouponModal = false;
  isEditingCoupon = false;
  editingCouponId: string | null = null;
  couponForm: any = {
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 100,
    maxDiscount: 150,
    usageLimit: 0,
    perUserLimit: 1,
    validUntil: '',
    isActive: true,
    isPublic: true
  };
  isSavingCoupon = false;
  couponErrorMessage = '';
  copiedCouponCode: string | null = null;

  loadCoupons() {
    this.isLoadingCoupons = true;
    this.api.getCoupons().subscribe({
      next: (data) => {
        this.coupons = data || [];
        this.isLoadingCoupons = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load coupons:', err);
        this.isLoadingCoupons = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadCouponStats() {
    this.api.getCouponStats().subscribe({
      next: (stats) => {
        this.couponStats = stats;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load coupon stats:', err)
    });
  }

  loadCouponOrders(code?: string) {
    this.isLoadingCouponOrders = true;
    this.api.getCouponOrders(code).subscribe({
      next: (orders) => {
        this.couponOrders = orders || [];
        this.isLoadingCouponOrders = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load coupon orders:', err);
        this.isLoadingCouponOrders = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredCoupons() {
    return (this.coupons || []).filter(c => {
      const q = (this.couponSearchTerm || '').trim().toLowerCase();
      const matchesSearch = !q ||
        (c.code && c.code.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q));
      const matchesStatus = this.couponStatusFilter === 'all' ||
        (this.couponStatusFilter === 'active' ? c.isActive : !c.isActive);
      return matchesSearch && matchesStatus;
    });
  }

  get filteredCouponOrders() {
    return (this.couponOrders || []).filter(o => {
      const matchesCode = this.selectedCouponFilter === 'all' ||
        (o.couponCode && o.couponCode.toUpperCase() === this.selectedCouponFilter.toUpperCase());
      const q = (this.couponTrackingSearch || '').trim().toLowerCase();
      const matchesSearch = !q ||
        (o.shortId && o.shortId.toLowerCase().includes(q)) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
        (o.customer?.phone && o.customer.phone.includes(q)) ||
        (o.customer?.email && o.customer.email.toLowerCase().includes(q)) ||
        (o.couponCode && o.couponCode.toLowerCase().includes(q));
      return matchesCode && matchesSearch;
    });
  }

  get totalCouponOrdersCount() {
    return this.couponStats?.totalOrdersWithCoupons || 0;
  }

  get totalCouponRevenue() {
    return this.couponStats?.totalCouponRevenue || 0;
  }

  get totalCouponDiscount() {
    return this.couponStats?.totalDiscountGranted || 0;
  }

  openCreateCouponModal() {
    this.isEditingCoupon = false;
    this.editingCouponId = null;
    this.couponErrorMessage = '';
    this.couponForm = {
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 100,
      maxDiscount: 150,
      usageLimit: 0,
      perUserLimit: 1,
      validUntil: '',
      isActive: true,
      isPublic: true
    };
    this.showCreateCouponModal = true;
  }

  openEditCouponModal(coupon: any) {
    this.isEditingCoupon = true;
    this.editingCouponId = coupon._id;
    this.couponErrorMessage = '';
    this.couponForm = {
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || 0,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscount: coupon.maxDiscount || 0,
      usageLimit: coupon.usageLimit || 0,
      perUserLimit: coupon.perUserLimit || 1,
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
      isPublic: coupon.isPublic !== undefined ? Boolean(coupon.isPublic) : true
    };
    this.showCreateCouponModal = true;
  }

  saveCoupon() {
    if (!this.couponForm.code || !this.couponForm.code.trim()) {
      this.couponErrorMessage = 'Coupon code is required.';
      return;
    }
    if (!this.couponForm.discountValue || Number(this.couponForm.discountValue) <= 0) {
      this.couponErrorMessage = 'Please enter a valid discount amount or percentage.';
      return;
    }
    this.isSavingCoupon = true;
    this.couponErrorMessage = '';

    const payload = {
      ...this.couponForm,
      code: this.couponForm.code.trim().toUpperCase(),
      discountValue: Number(this.couponForm.discountValue),
      minOrderAmount: Number(this.couponForm.minOrderAmount) || 0,
      maxDiscount: Number(this.couponForm.maxDiscount) || 0,
      usageLimit: Number(this.couponForm.usageLimit) || 0,
      perUserLimit: Number(this.couponForm.perUserLimit) || 1,
      validUntil: this.couponForm.validUntil ? new Date(this.couponForm.validUntil) : null,
      isActive: Boolean(this.couponForm.isActive),
      isPublic: Boolean(this.couponForm.isPublic)
    };

    const req$ = this.isEditingCoupon && this.editingCouponId
      ? this.api.updateCoupon(this.editingCouponId, payload)
      : this.api.createCoupon(payload);

    req$.subscribe({
      next: () => {
        this.isSavingCoupon = false;
        this.showCreateCouponModal = false;
        this.showNotification('Coupon "' + payload.code + '" ' + (this.isEditingCoupon ? 'updated' : 'created') + ' successfully!', 'success');
        this.loadCoupons();
        this.loadCouponStats();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSavingCoupon = false;
        this.couponErrorMessage = err?.error?.message || 'Failed to save coupon.';
        this.cdr.detectChanges();
      }
    });
  }

  toggleCouponPublic(coupon: any) {
    const newStatus = coupon.isPublic === false ? true : false;
    this.api.updateCoupon(coupon._id, { isPublic: newStatus }).subscribe({
      next: () => {
        coupon.isPublic = newStatus;
        this.showNotification(`Coupon "${coupon.code}" is now ${newStatus ? 'shown in Available Offers on Cart' : 'a Secret Promo Code'}!`, 'success');
        this.cdr.detectChanges();
      },
      error: () => this.showNotification('Failed to update coupon visibility', 'error')
    });
  }

  toggleCouponStatus(coupon: any) {
    const newStatus = !coupon.isActive;
    this.api.updateCoupon(coupon._id, { isActive: newStatus }).subscribe({
      next: () => {
        coupon.isActive = newStatus;
        this.showNotification('Coupon "' + coupon.code + '" ' + (newStatus ? 'activated' : 'deactivated') + '.', 'success');
        this.loadCouponStats();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to toggle coupon status:', err);
        this.showNotification('Failed to update status', 'error');
      }
    });
  }

  async deleteCoupon(coupon: any) {
    if (await this.showConfirm('Delete Coupon', 'Are you sure you want to permanently delete coupon "' + coupon.code + '"?', 'ðŸ—‘ï¸')) {
      this.api.deleteCoupon(coupon._id).subscribe({
        next: () => {
          this.showNotification('Coupon "' + coupon.code + '" deleted.', 'success');
          this.loadCoupons();
          this.loadCouponStats();
        },
        error: (err) => this.showNotification(err?.error?.message || 'Failed to delete coupon.', 'error')
      });
    }
  }

  trackCouponOrders(coupon: any) {
    this.selectedCouponFilter = coupon.code;
    this.couponTab = 'tracking';
    this.loadCouponOrders(coupon.code);
    this.cdr.detectChanges();
  }

  filterCouponOrdersByCode(code: string) {
    this.selectedCouponFilter = code;
    this.loadCouponOrders(code === 'all' ? undefined : code);
  }

  copyCouponCode(code: string) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      this.copiedCouponCode = code;
      this.showNotification('Copied code "' + code + '" to clipboard!', 'success');
      setTimeout(() => {
        if (this.copiedCouponCode === code) this.copiedCouponCode = null;
        this.cdr.detectChanges();
      }, 2000);
    }
  }

}

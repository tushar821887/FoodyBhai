import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TiffinService, TiffinPlan, TiffinOrderPayload, DayMenu } from '../../services/tiffin.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { RecipeService, Recipe } from '../../services/recipe.service';
import { CmsService } from '../../services/cms.service';
import { CmsPage, CmsSection } from '../../models/cms.model';
import { DynamicSectionRendererComponent } from '../../components/cms/dynamic-section-renderer/dynamic-section-renderer.component';

export interface ThaliAddon {
  id: string;
  name: string;
  category: 'Breads' | 'Curries & Dals' | 'Desserts & Sweets' | 'Sides & Drinks';
  price: number;
  quantity: number;
  icon?: string;
  image?: string;
  description?: string;
  recipe?: Recipe;
}

@Component({
  selector: 'app-tiffin',
  standalone: true,
  imports: [CommonModule, FormsModule, DynamicSectionRendererComponent],
  templateUrl: './tiffin.html',
  styleUrl: './tiffin.css'
})
export class TiffinComponent implements OnInit {
  private tiffinService = inject(TiffinService);
  private authService = inject(AuthService);
  public cartService = inject(CartService);
  private recipeService = inject(RecipeService);
  private cmsService = inject(CmsService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  cmsPage: CmsPage | null = null;
  cmsHeroSection: CmsSection | null = null;
  cmsOtherSections: CmsSection[] = [];

  config: any = null;
  plans: TiffinPlan[] = [];
  isLoading = true;

  // Duration selection: 'trial' (1 day), 'weekly' (7 days), 'monthly' (30 days)
  selectedDuration: 'trial' | 'weekly' | 'monthly' = 'weekly';
  dietaryFilter: 'all' | 'veg' | 'jain' = 'all';

  // Days for weekly rotating menu
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  activeDayIndex = 0; // Monday by default (or today's day)

  // Booking modal state (Subscription Flow)
  isBookingModalOpen = false;
  isSuccessModalOpen = false;
  isSubmitting = false;
  confirmedOrder: any = null;

  // Selected plan for booking modal
  activeBookingPlan: TiffinPlan | null = null;
  bookingDuration: 'trial' | 'weekly' | 'monthly' = 'weekly';
  bookingMealSlot: 'lunch' | 'dinner' | 'both' = 'both';

  // Customization & Add-on Modal State (Add to Cart Flow)
  isCustomizeModalOpen = false;
  activeCustomizingPlan: TiffinPlan | null = null;
  availableAddons: ThaliAddon[] = [];
  addonsFilter: string = 'all';

  // Cart toast notification
  cartToastMessage: string | null = null;
  private cartToastTimer: any = null;

  // Booking Form fields
  customerName = '';
  customerPhone = '';
  customerEmail = '';
  street = '';
  landmark = '';
  area = '';
  city = 'Meerut';
  pincode = '250002';
  startDate = '';
  specialInstructions = '';
  paymentMethod: 'cod' | 'upi' | 'online' = 'cod';
  formErrors: { [key: string]: string } = {};

  // FAQ state
  activeFaqIndex: number | null = 0;

  areasInMeerut = [
    'Shastri Nagar',
    'Saket',
    'Budhana Gate / Bhatwara',
    'Mangal Pandey Nagar',
    'Ganga Nagar',
    'Modipuram',
    'Pallavpuram',
    'Sadar Bazaar',
    'Begum Bridge Road',
    'Medical College Road',
    'Roorkee Road',
    'Delhi Road',
    'Jagriti Vihar',
    'Civil Lines',
    'Other Area in Meerut'
  ];

  ngOnInit() {
    this.setTodayMenuTab();
    this.setDefaultStartDate();
    this.loadData();
    this.prefillUser();
  }

  setTodayMenuTab() {
    const day = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    this.activeDayIndex = day === 0 ? 6 : day - 1;
  }

  setDefaultStartDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.startDate = tomorrow.toISOString().split('T')[0];
  }

  prefillUser() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.customerName = user.name || '';
      this.customerPhone = user.phone || '';
      this.customerEmail = user.email || '';
    }
  }

  loadData() {
    this.isLoading = true;

    // 0. Fetch dynamic CMS page for 'tiffin' (from Page Studio / CMS)
    this.cmsService.getPageBySlug('tiffin').subscribe(page => {
      if (page && page.sections && page.sections.length > 0) {
        this.cmsPage = JSON.parse(JSON.stringify(page));
        this.cmsHeroSection = page.sections.find(s => (s.type || '').toLowerCase() === 'hero') || null;
        this.cmsOtherSections = page.sections.filter(s => (s.type || '').toLowerCase() !== 'hero' && s.isEnabled !== false);
      } else {
        this.cmsPage = null;
        this.cmsHeroSection = null;
        this.cmsOtherSections = [];
      }
      this.cdr.detectChanges();
    });

    this.cmsService.fetchLivePages(true).subscribe(() => {
      this.cmsService.getPageBySlug('tiffin').subscribe(page => {
        if (page && page.sections && page.sections.length > 0) {
          this.cmsPage = JSON.parse(JSON.stringify(page));
          this.cmsHeroSection = page.sections.find(s => (s.type || '').toLowerCase() === 'hero') || null;
          this.cmsOtherSections = page.sections.filter(s => (s.type || '').toLowerCase() !== 'hero' && s.isEnabled !== false);
          this.cdr.detectChanges();
        }
      });
    });

    // 1. Fetch dynamic page configuration from database
    this.tiffinService.getConfig().subscribe({
      next: (cfg) => {
        if (cfg) {
          this.config = cfg;
          if (cfg.weeklyMenuSection?.menu && cfg.weeklyMenuSection.menu.length > 0) {
            this.daysOfWeek = cfg.weeklyMenuSection.menu.map((m: any) => m.day);
          }
          this.loadAddonsFromConfig(cfg.addons);
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    // 2. Fetch dynamic thalis from database
    this.tiffinService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAddonsFromConfig(addonsFromDb?: any[]) {
    const loadedAddons: ThaliAddon[] = [];

    if (Array.isArray(addonsFromDb) && addonsFromDb.length > 0) {
      addonsFromDb.forEach(ad => {
        loadedAddons.push({
          id: ad.id || `ad-${ad.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: ad.name,
          category: ad.category || 'Sides & Drinks',
          price: ad.price || 30,
          quantity: 0,
          icon: ad.icon || '🍲',
          description: ad.description || ''
        });
      });
    }

    this.availableAddons = loadedAddons;

    // Also enrich with live restaurant dishes from Menu
    this.recipeService.getRecipes().subscribe({
      next: (recipes) => {
        if (recipes && recipes.length > 0) {
          const menuExtras = recipes.slice(0, 10).map(r => ({
            id: `menu-${r._id || r.id}`,
            name: r.title,
            category: (r.category.includes('Breads') ? 'Breads' : (r.category.includes('Dessert') ? 'Desserts & Sweets' : 'Curries & Dals')) as any,
            price: r.price || 50,
            quantity: 0,
            image: r.image,
            recipe: r
          }));

          menuExtras.forEach(me => {
            if (!this.availableAddons.some(a => a.name.toLowerCase() === me.name.toLowerCase())) {
              this.availableAddons.push(me);
            }
          });
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  get filteredPlans(): TiffinPlan[] {
    if (this.dietaryFilter === 'all') return this.plans;
    return this.plans.filter(p => p.dietaryType === this.dietaryFilter);
  }

  get selectedDayMenu(): any {
    // 1. First priority: Config menu from Database
    if (this.config?.weeklyMenuSection?.menu && this.config.weeklyMenuSection.menu.length > 0) {
      const dayItem = this.config.weeklyMenuSection.menu[this.activeDayIndex];
      if (dayItem) return dayItem;
    }

    // 2. Second priority: Plan weeklyMenu from Database
    const referencePlan = this.plans.find(p => p.isPopular) || this.plans[0];
    if (referencePlan && referencePlan.weeklyMenu && referencePlan.weeklyMenu.length > 0) {
      const targetDay = this.daysOfWeek[this.activeDayIndex];
      const match = referencePlan.weeklyMenu.find(m => m.day.toLowerCase() === targetDay?.toLowerCase());
      return match || referencePlan.weeklyMenu[0];
    }

    return null;
  }

  getPriceForPlan(plan: TiffinPlan, duration: 'trial' | 'weekly' | 'monthly'): number {
    if (duration === 'trial') return plan.trialPrice || 99;
    if (duration === 'weekly') return plan.weeklyPrice || Math.round((plan.trialPrice || 99) * 6.5);
    return plan.monthlyPrice || Math.round((plan.trialPrice || 99) * 25);
  }

  getModalPrice(): number {
    if (!this.activeBookingPlan) return 0;
    const base = this.getPriceForPlan(this.activeBookingPlan, this.bookingDuration);
    if (this.bookingMealSlot === 'both') {
      return Math.round(base * 1.9);
    }
    return base;
  }

  getCalculatedMealsCount(): number {
    const multiplier = this.bookingMealSlot === 'both' ? 2 : 1;
    if (this.bookingDuration === 'trial') return 1 * multiplier;
    if (this.bookingDuration === 'weekly') return 7 * multiplier;
    return 30 * multiplier;
  }

  // --- ADD TO CART FLOW (WITHOUT SUBSCRIBING) ---

  convertPlanToRecipe(plan: TiffinPlan): Recipe {
    return {
      id: plan._id ? Math.abs(this.hashCode(plan._id)) : Math.floor(1000 + Math.random() * 9000),
      _id: plan._id,
      slug: plan.slug,
      title: plan.name,
      description: plan.description || plan.tagline || 'Homemade delicious thali',
      introduction: plan.tagline || plan.description || 'Delicious freshly prepared homemade meal',
      price: plan.trialPrice || 99,
      image: plan.image || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
      imageAlt: plan.name,
      category: 'Thalis And Mini Meals',
      cuisine: 'North Indian',
      isVeg: plan.dietaryType === 'veg',
      inStock: true,
      prepTime: '20 mins',
      cookTime: '15 mins',
      totalTime: '35 mins',
      servings: 1,
      difficulty: 'Easy',
      ingredients: plan.items || [],
      instructions: [],
      tips: plan.features || [],
      seoTitle: plan.name,
      seoDescription: plan.tagline || plan.description
    };
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  quickAddToCart(plan: TiffinPlan, event?: Event) {
    if (event) event.stopPropagation();
    const recipe = this.convertPlanToRecipe(plan);
    this.cartService.addToCart(recipe);
    this.showCartToast(`🍱 "${plan.name}" added to cart!`);
  }

  openCustomizeModal(plan: TiffinPlan, event?: Event) {
    if (event) event.stopPropagation();
    this.activeCustomizingPlan = plan;
    this.availableAddons.forEach(a => a.quantity = 0);
    this.addonsFilter = 'all';
    this.isCustomizeModalOpen = true;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeCustomizeModal() {
    this.isCustomizeModalOpen = false;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto';
    }
  }

  get filteredAddons(): ThaliAddon[] {
    if (this.addonsFilter === 'all') return this.availableAddons;
    return this.availableAddons.filter(a => a.category === this.addonsFilter);
  }

  incrementAddon(addon: ThaliAddon) {
    addon.quantity++;
  }

  decrementAddon(addon: ThaliAddon) {
    if (addon.quantity > 0) addon.quantity--;
  }

  get addonsTotalPrice(): number {
    return this.availableAddons.reduce((sum, a) => sum + (a.price * a.quantity), 0);
  }

  get selectedAddonsCount(): number {
    return this.availableAddons.reduce((sum, a) => sum + a.quantity, 0);
  }

  get customizeGrandTotal(): number {
    if (!this.activeCustomizingPlan) return 0;
    return (this.activeCustomizingPlan.trialPrice || 0) + this.addonsTotalPrice;
  }

  confirmAddToCartWithCustomization() {
    if (!this.activeCustomizingPlan) return;

    // 1. Add main thali to cart
    const thaliRecipe = this.convertPlanToRecipe(this.activeCustomizingPlan);
    this.cartService.addToCart(thaliRecipe);

    // 2. Add each selected extra addon to cart
    let addedExtrasCount = 0;
    this.availableAddons.forEach(addon => {
      if (addon.quantity > 0) {
        addedExtrasCount += addon.quantity;
        const addonRecipe: Recipe = addon.recipe || {
          id: Math.abs(this.hashCode(addon.id)),
          _id: addon.id,
          slug: addon.id,
          title: addon.name,
          description: addon.description || 'Thali add-on item',
          introduction: addon.description || 'Thali add-on accompaniment',
          price: addon.price,
          image: addon.image || this.activeCustomizingPlan?.image || '',
          imageAlt: addon.name,
          category: addon.category,
          cuisine: 'Indian',
          isVeg: true,
          inStock: true,
          prepTime: '10 mins',
          cookTime: '10 mins',
          totalTime: '20 mins',
          servings: 1,
          difficulty: 'Easy',
          ingredients: [],
          instructions: [],
          tips: [],
          seoTitle: addon.name,
          seoDescription: addon.name
        };

        for (let i = 0; i < addon.quantity; i++) {
          this.cartService.addToCart(addonRecipe);
        }
      }
    });

    const msg = addedExtrasCount > 0 
      ? `🍱 "${this.activeCustomizingPlan.name}" + ${addedExtrasCount} add-on(s) added to cart!`
      : `🍱 "${this.activeCustomizingPlan.name}" added to cart!`;

    this.showCartToast(msg);
    this.closeCustomizeModal();
  }

  showCartToast(msg: string) {
    this.cartToastMessage = msg;
    if (this.cartToastTimer) clearTimeout(this.cartToastTimer);
    this.cartToastTimer = setTimeout(() => {
      this.cartToastMessage = null;
      this.cdr.detectChanges();
    }, 4500);
    this.cdr.detectChanges();
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  // --- RECURRING SUBSCRIPTION MODAL FLOW ---

  openBookingModal(plan: TiffinPlan, duration?: 'trial' | 'weekly' | 'monthly') {
    this.activeBookingPlan = plan;
    this.bookingDuration = duration || this.selectedDuration;
    this.formErrors = {};
    this.isBookingModalOpen = true;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeBookingModal() {
    this.isBookingModalOpen = false;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto';
    }
  }

  validateForm(): boolean {
    this.formErrors = {};
    if (!this.customerName.trim()) this.formErrors['name'] = 'Name is required';
    const phonePattern = /^[6-9]\d{9}$/;
    const cleanPhone = this.customerPhone.replace(/[\s\-\+]/g, '').slice(-10);
    if (!phonePattern.test(cleanPhone)) {
      this.formErrors['phone'] = 'Please enter a valid 10-digit mobile number';
    }
    if (!this.street.trim()) this.formErrors['street'] = 'House / flat / street address is required';
    if (!this.area) this.formErrors['area'] = 'Please select your area in Meerut';
    if (!this.startDate) this.formErrors['startDate'] = 'Please select a starting date';
    return Object.keys(this.formErrors).length === 0;
  }

  submitBooking() {
    if (!this.validateForm() || !this.activeBookingPlan) return;

    this.isSubmitting = true;
    const cleanPhone = this.customerPhone.replace(/[\s\-\+]/g, '').slice(-10);

    const payload: TiffinOrderPayload = {
      customerName: this.customerName.trim(),
      customerPhone: cleanPhone,
      customerEmail: this.customerEmail.trim() || undefined,
      planId: this.activeBookingPlan._id || this.activeBookingPlan.slug,
      planName: this.activeBookingPlan.name,
      subscriptionType: this.bookingDuration,
      mealSlot: this.bookingMealSlot,
      startDate: this.startDate,
      totalMeals: this.getCalculatedMealsCount(),
      totalAmount: this.getModalPrice(),
      deliveryAddress: {
        street: this.street.trim(),
        landmark: this.landmark.trim() || undefined,
        area: this.area,
        city: this.city || 'Meerut',
        pincode: this.pincode || '250002'
      },
      specialInstructions: this.specialInstructions.trim() || undefined,
      paymentMethod: this.paymentMethod
    };

    this.tiffinService.createSubscription(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.confirmedOrder = res;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('foodybhai_user_phone', cleanPhone);
          localStorage.setItem('foodybhai_user_name', this.customerName.trim());
        }
        this.closeBookingModal();
        this.isSuccessModalOpen = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSubmitting = false;
        alert('Could not submit booking right now. Please try again or call kitchen.');
        this.cdr.detectChanges();
      }
    });
  }

  closeSuccessModal() {
    this.isSuccessModalOpen = false;
    this.confirmedOrder = null;
    this.router.navigate(['/']);
  }

  toggleFaq(index: number) {
    this.activeFaqIndex = this.activeFaqIndex === index ? null : index;
  }

  scrollToPlans() {
    const el = document.getElementById('tiffin-plans-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToWeeklyMenu() {
    const el = document.getElementById('weekly-menu-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

import { Component, OnInit, inject, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { RichEditorComponent } from '../rich-editor/rich-editor.component';

export interface AdminTiffinPlan {
  _id?: string;
  name: string;
  slug?: string;
  tagline?: string;
  description: string;
  dietaryType: 'veg' | 'non-veg' | 'jain';
  mealType: 'lunch' | 'dinner' | 'both';
  trialPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  perMealPrice?: number;
  items: string[];
  itemsHtml?: string;
  features: string[];
  featuresHtml?: string;
  image: string;
  isPopular: boolean;
  isBestValue: boolean;
  isActive: boolean;
  rating?: number;
  reviewsCount?: number;
  lunchDeliveryTime?: string;
  dinnerDeliveryTime?: string;
}

@Component({
  selector: 'app-tiffin-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RichEditorComponent],
  templateUrl: './tiffin-manager.component.html',
  styleUrl: './tiffin-manager.component.css'
})
export class TiffinManagerComponent implements OnInit {
  @Output() openCms = new EventEmitter<void>();
  private router = inject(Router);

  goToPageStudio() {
    this.openCms.emit();
    this.router.navigate(['/cms'], { queryParams: { slug: 'tiffin' } });
  }
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  activeTab: 'plans' | 'menu' | 'orders' = 'plans';

  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  activeDayIndex = 0;
  weeklyMenu: any[] = [];
  isSavingMenu = false;
  menuSuccessMsg = '';
  menuErrorMsg = '';

  plans: AdminTiffinPlan[] = [];
  orders: any[] = [];

  isLoading = false;
  searchQuery = '';
  dietaryFilter = 'all';

  // Modal State
  isModalOpen = false;
  isEditing = false;
  editingId: string | null = null;
  isSaving = false;
  modalError = '';

  // Form Model
  formModel = this.getEmptyForm();

  ngOnInit() {
    this.loadPlans();
    this.loadOrders();
    this.loadWeeklyMenu();

    const day = new Date().getDay();
    this.activeDayIndex = day === 0 ? 6 : day - 1;
  }

  getEmptyForm() {
    const defaultItems = [
      '4 Desi Ghee Soft Phulkas',
      'Rich Dal Fry / Dal Tadka',
      'Special Seasonal Sabzi',
      'Fragrant Jeera Rice',
      'Fresh Cut Salad, Green Chutney & Pickle'
    ];
    const defaultFeatures = [
      'Pure Desi Ghee Phulkas',
      '100% RO Water Cooking',
      'Zero Preservatives',
      'Daily Hot Delivery'
    ];

    return {
      name: '',
      tagline: '',
      description: '<p>A complete, balanced, nutritious meal prepared just like maa ke haath ka khana with pure desi ghee phulkas.</p>',
      dietaryType: 'veg' as 'veg' | 'non-veg' | 'jain',
      mealType: 'both' as 'lunch' | 'dinner' | 'both',
      trialPrice: 99,
      weeklyPrice: 649,
      monthlyPrice: 2399,
      perMealPrice: 80,
      rating: 4.9,
      reviewsCount: 150,
      itemsHtml: `<ul>${defaultItems.map(i => `<li>${i}</li>`).join('')}</ul>`,
      featuresHtml: `<ul>${defaultFeatures.map(f => `<li>${f}</li>`).join('')}</ul>`,
      itemsText: defaultItems.join('\n'),
      featuresText: defaultFeatures.join(', '),
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
      isPopular: false,
      isBestValue: false,
      isActive: true,
      lunchDeliveryTime: '12:30 PM - 02:00 PM',
      dinnerDeliveryTime: '07:30 PM - 09:30 PM'
    };
  }

  loadPlans() {
    this.isLoading = true;
    this.api.getTiffinPlans(true).subscribe({
      next: (data) => {
        this.plans = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load tiffin plans', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadWeeklyMenu() {
    this.api.getTiffinConfig().subscribe({
      next: (cfg) => {
        if (cfg?.weeklyMenu && cfg.weeklyMenu.length >= 7) {
          this.weeklyMenu = JSON.parse(JSON.stringify(cfg.weeklyMenu));
        } else {
          this.weeklyMenu = this.getDefaultWeeklyMenu();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.weeklyMenu = this.getDefaultWeeklyMenu();
        this.cdr.detectChanges();
      }
    });
  }

  get currentDayMenu(): any {
    if (!this.weeklyMenu || this.weeklyMenu.length === 0) {
      return null;
    }
    const dayName = this.daysOfWeek[this.activeDayIndex];
    return this.weeklyMenu.find(m => m.day.toLowerCase() === dayName.toLowerCase()) || this.weeklyMenu[this.activeDayIndex] || this.weeklyMenu[0];
  }

  saveWeeklyMenu() {
    this.isSavingMenu = true;
    this.menuSuccessMsg = '';
    this.menuErrorMsg = '';

    this.api.updateTiffinConfig({ weeklyMenu: this.weeklyMenu }).subscribe({
      next: () => {
        this.isSavingMenu = false;
        this.menuSuccessMsg = 'Weekly menu schedule saved live to the website!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.menuSuccessMsg = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err) => {
        this.isSavingMenu = false;
        this.menuErrorMsg = 'Failed to save menu: ' + (err?.error?.message || err.message);
        this.cdr.detectChanges();
      }
    });
  }

  resetToDefaultMenu() {
    if (confirm('Reset the weekly rotation to chef standard homestyle menu?')) {
      this.weeklyMenu = this.getDefaultWeeklyMenu();
      this.saveWeeklyMenu();
    }
  }

  getDefaultWeeklyMenu(): any[] {
    return [
      { day: 'Monday', lunch: { main: 'Shahi Paneer + Aloo Gobhi', dal: 'Dal Tadka', breadRice: '4 Phulkas + Jeera Rice', sides: 'Salad & Achar', price: 99, time: '12:30 PM - 02:00 PM' }, dinner: { main: 'Mix Veg Curry', dal: 'Moong Dal', breadRice: '4 Phulkas + Rice', sides: 'Salad', price: 89, time: '07:30 PM - 09:30 PM' } },
      { day: 'Tuesday', lunch: { main: 'Delhi Rajma Masala', dal: 'Yellow Moong Dal', breadRice: '4 Phulkas + Jeera Rice', sides: 'Boondi Raita', price: 99, time: '12:30 PM - 02:00 PM' }, dinner: { main: 'Lauki Kofta', dal: 'Panchmel Dal', breadRice: '4 Phulkas + Rice', sides: 'Salad', price: 89, time: '07:30 PM - 09:30 PM' } },
      { day: 'Wednesday', lunch: { main: 'Kadhai Paneer', dal: 'Dal Makhani', breadRice: '4 Phulkas + Peas Pulao', sides: 'Cucumber Raita', price: 109, time: '12:30 PM - 02:00 PM' }, dinner: { main: 'Aloo Methi', dal: 'Masoor Dal', breadRice: '4 Phulkas + Rice', sides: 'Salad', price: 89, time: '07:30 PM - 09:30 PM' } },
      { day: 'Thursday', lunch: { main: 'Punjabi Kadhi Pakora', dal: 'Arhar Dal', breadRice: '4 Phulkas + Jeera Rice', sides: 'Papad & Salad', price: 99, time: '12:30 PM - 02:00 PM' }, dinner: { main: 'Bhindi Masala', dal: 'Chana Dal', breadRice: '4 Phulkas + Rice', sides: 'Salad', price: 89, time: '07:30 PM - 09:30 PM' } },
      { day: 'Friday', lunch: { main: 'Amritsari Pindi Chole', dal: 'Dal Makhani', breadRice: '4 Phulkas + Kashmiri Pulao', sides: 'Mint Raita', price: 109, time: '12:30 PM - 02:00 PM' }, dinner: { main: 'Matar Mushroom', dal: 'Dal Tadka', breadRice: '4 Phulkas + Rice', sides: 'Salad', price: 99, time: '07:30 PM - 09:30 PM' } },
      { day: 'Saturday', lunch: { main: 'Paneer Butter Masala', dal: 'Moong Dal Tadka', breadRice: '4 Phulkas + Jeera Rice', sides: 'Veg Raita', price: 119, time: '12:30 PM - 02:00 PM' }, dinner: { main: 'Dum Aloo', dal: 'Dal Fry', breadRice: '4 Phulkas + Rice', sides: 'Salad', price: 89, time: '07:30 PM - 09:30 PM' } },
      { day: 'Sunday', lunch: { main: 'Chef Special Royal Thali', dal: 'Special Dal Makhani', breadRice: '4 Phulkas + Veg Biryani', sides: 'Gulab Jamun + Raita + Papad', price: 149, time: '12:30 PM - 02:00 PM' }, dinner: { main: 'Paneer Bhurji Gravy', dal: 'Dal Tadka', breadRice: '4 Phulkas + Rice', sides: 'Salad', price: 99, time: '07:30 PM - 09:30 PM' } }
    ];
  }

  isToday(index: number): boolean {
    const today = new Date().getDay();
    const todayIdx = today === 0 ? 6 : today - 1;
    return index === todayIdx;
  }

  orderSearchQuery = '';
  orderStatusFilter = 'all';
  isRefreshingOrders = false;

  loadOrders() {
    this.isRefreshingOrders = true;
    this.api.getTiffinOrders().subscribe({
      next: (data) => {
        this.orders = data || [];
        this.isRefreshingOrders = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isRefreshingOrders = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredOrders(): any[] {
    return this.orders.filter(ord => {
      const matchesStatus = this.orderStatusFilter === 'all' || ord.status === this.orderStatusFilter;
      const q = (this.orderSearchQuery || '').toLowerCase().trim();
      const matchesSearch = !q ||
        (ord.orderId && ord.orderId.toLowerCase().includes(q)) ||
        (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
        (ord.customerPhone && ord.customerPhone.includes(q)) ||
        (ord.planName && ord.planName.toLowerCase().includes(q)) ||
        (ord.deliveryAddress?.area && ord.deliveryAddress.area.toLowerCase().includes(q)) ||
        (ord.deliveryAddress?.street && ord.deliveryAddress.street.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }

  get activeOrdersCount(): number {
    return this.orders.filter(o => o.status === 'active').length;
  }

  get pausedOrdersCount(): number {
    return this.orders.filter(o => o.status === 'paused').length;
  }

  get completedOrdersCount(): number {
    return this.orders.filter(o => o.status === 'completed').length;
  }

  get cancelledOrdersCount(): number {
    return this.orders.filter(o => o.status === 'cancelled').length;
  }

  get filteredPlans(): AdminTiffinPlan[] {
    return this.plans.filter(p => {
      const matchSearch = !this.searchQuery.trim() || 
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (p.tagline && p.tagline.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchDiet = this.dietaryFilter === 'all' || p.dietaryType === this.dietaryFilter;
      return matchSearch && matchDiet;
    });
  }

  parseHtmlToItems(html: string): string[] {
    if (!html || !html.trim()) return [];

    if (!html.includes('<')) {
      return html
        .split(/[\n,]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }

    if (typeof DOMParser !== 'undefined') {
      try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const liList = Array.from(doc.querySelectorAll('li'));
        if (liList.length > 0) {
          return liList
            .map(li => li.innerHTML.trim())
            .filter(s => s.length > 0 && s !== '<br>' && s !== '&nbsp;');
        }
        const blockList = Array.from(doc.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6'));
        if (blockList.length > 0) {
          const items = blockList
            .map(el => el.innerHTML.trim())
            .filter(s => s.length > 0 && s !== '<br>' && s !== '&nbsp;');
          if (items.length > 0) return items;
        }
        const parts = doc.body.innerHTML.split(/<br\s*\/?>/i);
        if (parts.length > 1) {
          return parts
            .map(p => p.trim())
            .filter(p => p.length > 0 && p !== '&nbsp;');
        }
        const text = doc.body.textContent || '';
        return text
          .split(/[\n,]+/)
          .map(s => s.trim())
          .filter(s => s.length > 0);
      } catch (e) {}
    }

    const liMatches = html.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    if (liMatches) {
      return liMatches
        .map(m => m.replace(/<\/?li[^>]*>/gi, '').trim())
        .filter(m => m.length > 0);
    }

    return html
      .replace(/<[^>]+>/g, '\n')
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  get parsedItemsPreview(): string[] {
    return this.parseHtmlToItems(this.formModel.itemsHtml);
  }

  get parsedFeaturesPreview(): string[] {
    return this.parseHtmlToItems(this.formModel.featuresHtml);
  }

  loadTemplate(type: 'mini' | 'standard' | 'deluxe') {
    if (type === 'mini') {
      const items = [
        '3 Fresh Tawa Rotis (100% Whole Wheat)',
        'Dal Tadka / Homestyle Dal Fry',
        'Seasonal Sukhi Sabzi (Aloo Gobhi / Bhindi / Beans)',
        'Steamed Basmati Rice',
        'Fresh Green Salad & Pickle'
      ];
      const features = [
        'Zero Preservatives & Low Oil',
        '100% Desi Homestyle Taste',
        'Daily Delivery on Time'
      ];
      this.formModel = {
        name: 'Rozana Mini Thali',
        tagline: 'Light, healthy & pocket-friendly everyday meal',
        description: '<p>Ideal for students and light eaters looking for comforting homestyle food with minimal oil.</p>',
        dietaryType: 'veg',
        mealType: 'both',
        trialPrice: 79,
        weeklyPrice: 499,
        monthlyPrice: 1899,
        perMealPrice: 65,
        rating: 4.8,
        reviewsCount: 94,
        itemsHtml: `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`,
        featuresHtml: `<ul>${features.map(f => `<li>${f}</li>`).join('')}</ul>`,
        itemsText: items.join('\n'),
        featuresText: features.join(', '),
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        isPopular: false,
        isBestValue: false,
        isActive: true,
        lunchDeliveryTime: '12:30 PM - 02:00 PM',
        dinnerDeliveryTime: '07:30 PM - 09:30 PM'
      };
    } else if (type === 'standard') {
      const items = [
        '4 Desi Ghee Soft Phulkas',
        'Rich Dal Fry / Dal Tadka',
        'Special Seasonal Sabzi (Paneer / Mix Veg / Gobhi)',
        'Fragrant Jeera Rice',
        'Fresh Cut Salad, Green Chutney & Pickle',
        'Curd / Raita (With Lunch)'
      ];
      const features = [
        'Desi Ghee Basted Phulkas',
        '100% RO Water Cooking',
        'Daily Rotating Gourmet Menu',
        'Free Pause & Resume Anytime'
      ];
      this.formModel = {
        name: 'Ghar Jaisa Standard Thali',
        tagline: "Meerut's Most Loved Homestyle Tiffin",
        description: '<p>A complete, balanced, nutritious meal prepared just like maa ke haath ka khana with pure desi ghee phulkas.</p>',
        dietaryType: 'veg',
        mealType: 'both',
        trialPrice: 99,
        weeklyPrice: 649,
        monthlyPrice: 2399,
        perMealPrice: 80,
        rating: 4.9,
        reviewsCount: 312,
        itemsHtml: `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`,
        featuresHtml: `<ul>${features.map(f => `<li>${f}</li>`).join('')}</ul>`,
        itemsText: items.join('\n'),
        featuresText: features.join(', '),
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        isPopular: true,
        isBestValue: true,
        isActive: true,
        lunchDeliveryTime: '12:30 PM - 02:00 PM',
        dinnerDeliveryTime: '07:30 PM - 09:30 PM'
      };
    } else if (type === 'deluxe') {
      const items = [
        '4 Desi Ghee Butter Phulkas',
        'Premium Paneer Dish (Paneer Lababdar / Butter Masala)',
        'Seasonal Special Dry Sabzi',
        'Special Dal (Dal Makhani / Panchmel Tadka)',
        'Gourmet Veg Biryani / Jeera Rice',
        'Flavoured Raita + Roasted Papad',
        'Daily Dessert (Gulab Jamun / Kheer / Halwa)'
      ];
      const features = [
        'Pure Amul Desi Ghee & Butter',
        'Premium Shahi Gravy',
        'Daily Fresh Sweet Included',
        'VIP Express Delivery'
      ];
      this.formModel = {
        name: 'Deluxe Shahi Thali',
        tagline: 'The ultimate royal feast delivered daily',
        description: '<p>Indulge in a royal homestyle dining experience with premium paneer, gourmet dal, special breads and daily sweet treat.</p>',
        dietaryType: 'veg',
        mealType: 'both',
        trialPrice: 139,
        weeklyPrice: 899,
        monthlyPrice: 3299,
        perMealPrice: 110,
        rating: 5.0,
        reviewsCount: 178,
        itemsHtml: `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`,
        featuresHtml: `<ul>${features.map(f => `<li>${f}</li>`).join('')}</ul>`,
        itemsText: items.join('\n'),
        featuresText: features.join(', '),
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
        isPopular: false,
        isBestValue: false,
        isActive: true,
        lunchDeliveryTime: '12:30 PM - 02:00 PM',
        dinnerDeliveryTime: '07:30 PM - 09:30 PM'
      };
    }
  }

  onImageFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.formModel.image = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  openCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.formModel = this.getEmptyForm();
    this.modalError = '';
    this.isModalOpen = true;
  }

  openEditModal(plan: AdminTiffinPlan) {
    this.isEditing = true;
    this.editingId = plan._id || null;
    this.modalError = '';

    const items = plan.items || [];
    const features = plan.features || [];

    const itemsHtml = plan.itemsHtml && plan.itemsHtml.trim().length > 0 
      ? plan.itemsHtml 
      : (items.length > 0 ? `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>` : '');

    const featuresHtml = plan.featuresHtml && plan.featuresHtml.trim().length > 0 
      ? plan.featuresHtml 
      : (features.length > 0 ? `<ul>${features.map(f => `<li>${f}</li>`).join('')}</ul>` : '');

    this.formModel = {
      name: plan.name,
      tagline: plan.tagline || '',
      description: plan.description || '',
      dietaryType: plan.dietaryType || 'veg',
      mealType: plan.mealType || 'both',
      trialPrice: plan.trialPrice,
      weeklyPrice: plan.weeklyPrice,
      monthlyPrice: plan.monthlyPrice,
      perMealPrice: plan.perMealPrice || Math.round((plan.weeklyPrice || plan.trialPrice * 6.5) / 7),
      rating: plan.rating || 4.9,
      reviewsCount: plan.reviewsCount || 100,
      itemsHtml,
      featuresHtml,
      itemsText: items.join('\n'),
      featuresText: features.join(', '),
      image: plan.image || '',
      isPopular: !!plan.isPopular,
      isBestValue: !!plan.isBestValue,
      isActive: plan.isActive !== false,
      lunchDeliveryTime: plan.lunchDeliveryTime || '12:30 PM - 02:00 PM',
      dinnerDeliveryTime: plan.dinnerDeliveryTime || '07:30 PM - 09:30 PM'
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  toggleActive(plan: AdminTiffinPlan, event: Event) {
    event.stopPropagation();
    if (!plan._id) return;
    this.api.toggleTiffinPlan(plan._id).subscribe({
      next: (res) => {
        plan.isActive = res.isActive;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to toggle status', err);
      }
    });
  }

  deletePlan(plan: AdminTiffinPlan, event: Event) {
    event.stopPropagation();
    if (!plan._id) return;
    if (confirm(`Are you sure you want to delete "${plan.name}"?`)) {
      this.api.deleteTiffinPlan(plan._id).subscribe({
        next: () => {
          this.plans = this.plans.filter(p => p._id !== plan._id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert('Failed to delete thali: ' + (err?.error?.message || err.message));
        }
      });
    }
  }

  seedDefaults() {
    if (confirm('This will seed/restore the standard handcrafted Thalis into the database. Continue?')) {
      this.isLoading = true;
      this.api.seedTiffinPlans().subscribe({
        next: (plans) => {
          this.plans = plans || [];
          this.isLoading = false;
          this.cdr.detectChanges();
          alert('Default Thalis seeded successfully!');
        },
        error: (err) => {
          this.isLoading = false;
          alert('Failed to seed: ' + err.message);
        }
      });
    }
  }

  savePlan() {
    if (!this.formModel.name.trim()) {
      this.modalError = 'Please enter a Thali name';
      return;
    }
    if (!this.formModel.trialPrice || this.formModel.trialPrice <= 0) {
      this.modalError = 'Please enter a valid price';
      return;
    }

    this.isSaving = true;
    this.modalError = '';

    const items = this.parsedItemsPreview;
    const features = this.parsedFeaturesPreview;

    const calculatedPerMeal = this.formModel.perMealPrice > 0 
      ? Number(this.formModel.perMealPrice)
      : Math.round(Number(this.formModel.weeklyPrice || this.formModel.trialPrice * 6.5) / 7);

    const slug = this.formModel.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const payload: any = {
      name: this.formModel.name.trim(),
      slug: slug || undefined,
      tagline: this.formModel.tagline.trim(),
      description: this.formModel.description || 'Nutritious homestyle Indian meal',
      dietaryType: this.formModel.dietaryType,
      mealType: this.formModel.mealType,
      trialPrice: Number(this.formModel.trialPrice),
      weeklyPrice: Number(this.formModel.weeklyPrice || this.formModel.trialPrice * 6.5),
      monthlyPrice: Number(this.formModel.monthlyPrice || this.formModel.trialPrice * 25),
      perMealPrice: calculatedPerMeal,
      rating: Number(this.formModel.rating || 4.9),
      reviewsCount: Number(this.formModel.reviewsCount || 100),
      items: items.length > 0 ? items : ['Fresh Sabzi', 'Dal', '4 Phulkas', 'Rice', 'Salad'],
      itemsHtml: this.formModel.itemsHtml,
      features: features.length > 0 ? features : ['100% RO Water', 'Pure Desi Ghee', 'Fresh Hot Delivery'],
      featuresHtml: this.formModel.featuresHtml,
      image: this.formModel.image.trim() || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
      isPopular: this.formModel.isPopular,
      isBestValue: this.formModel.isBestValue,
      isActive: this.formModel.isActive,
      lunchDeliveryTime: this.formModel.lunchDeliveryTime,
      dinnerDeliveryTime: this.formModel.dinnerDeliveryTime
    };

    if (this.isEditing && this.editingId) {
      this.api.updateTiffinPlan(this.editingId, payload).subscribe({
        next: (updated) => {
          this.isSaving = false;
          this.isModalOpen = false;
          const idx = this.plans.findIndex(p => p._id === this.editingId);
          if (idx !== -1) {
            this.plans[idx] = updated;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          this.modalError = err?.error?.message || 'Failed to update plan';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.api.createTiffinPlan(payload).subscribe({
        next: (created) => {
          this.isSaving = false;
          this.isModalOpen = false;
          this.plans.unshift(created);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          this.modalError = err?.error?.message || 'Failed to create plan';
          this.cdr.detectChanges();
        }
      });
    }
  }

  updateOrderStatus(order: any, newStatus: string) {
    this.api.updateTiffinOrderStatus(order._id || order.orderId, newStatus).subscribe({
      next: (res) => {
        order.status = newStatus;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Failed to update status');
      }
    });
  }
}

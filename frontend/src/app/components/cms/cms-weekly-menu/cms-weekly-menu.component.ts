import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CmsSection } from '../../../models/cms.model';
import { TiffinService, DayMenu } from '../../../services/tiffin.service';
import { CartService } from '../../../services/cart.service';
import { Recipe } from '../../../services/recipe.service';

@Component({
  selector: 'app-cms-weekly-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="cms-weekly-menu-section"
             [class.is-light-text]="section.style?.textColor === '#ffffff'"
             [style.padding-top]="section.style?.paddingTop || '70px'"
             [style.padding-bottom]="section.style?.paddingBottom || '70px'"
             [style.background-color]="section.style?.backgroundColor || '#ffffff'"
             [style.background]="section.style?.backgroundGradient || section.style?.backgroundColor || '#ffffff'"
             [style.color]="section.style?.textColor || 'inherit'">
      <div class="container" [style.max-width]="section.style?.maxWidth || '1200px'">

        <!-- Section Header -->
        <div class="section-header text-center animate-fade-in">
          <div *ngIf="section.badge || 'Chef\\'s Daily Rotation'" class="section-tag">
            {{ section.badge || "Chef's Daily Rotation" }}
          </div>

          <h2 class="section-title"
              [style.color]="section.style?.textColor || '#1e293b'"
              [style.font-size]="section.style?.titleFontSize || '36px'"
              [innerHTML]="section.title || 'See What\\'s Cooking This Week'">
          </h2>

          <p class="section-desc"
             [style.color]="section.style?.textColor ? (section.style?.textColor === '#ffffff' ? 'rgba(255,255,255,0.85)' : section.style?.textColor) : '#64748b'"
             [style.font-size]="section.style?.contentFontSize || '16px'"
             [innerHTML]="section.subtitle || 'Every day brings a delightful surprise prepared fresh with authentic spices, desi ghee, and zero preservatives.'">
          </p>

          <!-- Day Tabs -->
          <div class="days-tab-scroller">
            <button type="button" 
                    *ngFor="let day of daysOfWeek; let i = index"
                    class="day-pill-btn" 
                    [class.active]="activeDayIndex === i"
                    (click)="activeDayIndex = i">
              <span class="day-name">{{ day.substring(0, 3) }}</span>
              <span class="day-full">{{ day }}</span>
            </button>
          </div>
        </div>

        <!-- Selected Day Menu Display -->
        <div class="day-menu-cards-grid animate-fade-in" *ngIf="currentDayMenu">
          
          <!-- LUNCH CARD -->
          <div class="meal-slot-card lunch-card" *ngIf="currentDayMenu.lunch">
            <div class="meal-slot-header">
              <div class="slot-title-wrap">
                <span class="slot-icon">☀️</span>
                <div>
                  <h3 class="slot-title">Lunch Spread</h3>
                  <span class="slot-time"><i class="fa-regular fa-clock"></i> 12:30 PM - 02:00 PM</span>
                </div>
              </div>
              <span class="slot-tag">Hot & Fresh</span>
            </div>

            <div class="meal-slot-items">
              <div class="menu-item-row" *ngIf="currentDayMenu.lunch.main">
                <div class="item-icon-box">🍛</div>
                <div class="item-detail">
                  <span class="item-label">Main Sabzi</span>
                  <span class="item-name">{{ currentDayMenu.lunch.main }}</span>
                </div>
              </div>

              <div class="menu-item-row" *ngIf="currentDayMenu.lunch.dal">
                <div class="item-icon-box">🥣</div>
                <div class="item-detail">
                  <span class="item-label">Dal / Gravy</span>
                  <span class="item-name">{{ currentDayMenu.lunch.dal }}</span>
                </div>
              </div>

              <div class="menu-item-row" *ngIf="currentDayMenu.lunch.breadRice">
                <div class="item-icon-box">🫓</div>
                <div class="item-detail">
                  <span class="item-label">Breads & Rice</span>
                  <span class="item-name">{{ currentDayMenu.lunch.breadRice }}</span>
                </div>
              </div>

              <div class="menu-item-row" *ngIf="currentDayMenu.lunch.sides">
                <div class="item-icon-box">🥗</div>
                <div class="item-detail">
                  <span class="item-label">Accompaniments</span>
                  <span class="item-name">{{ currentDayMenu.lunch.sides }}</span>
                </div>
              </div>
            </div>

            <!-- ACTION FOOTER: PRICE & ADD TO CART -->
            <div class="meal-slot-footer">
              <div class="meal-price-wrap">
                <span class="price-currency">₹</span>
                <span class="price-amount">{{ currentDayMenu.lunch.price || 99 }}</span>
                <span class="price-sub">/ hot meal</span>
              </div>
              <button type="button" 
                      class="btn-slot-cart" 
                      (click)="addMealToCart(currentDayMenu.day, 'lunch', currentDayMenu.lunch)">
                <span>+</span> Add to Cart
              </button>
            </div>
          </div>

          <!-- DINNER CARD -->
          <div class="meal-slot-card dinner-card" *ngIf="currentDayMenu.dinner">
            <div class="meal-slot-header">
              <div class="slot-title-wrap">
                <span class="slot-icon">🌙</span>
                <div>
                  <h3 class="slot-title">Dinner Spread</h3>
                  <span class="slot-time"><i class="fa-regular fa-clock"></i> 07:30 PM - 09:30 PM</span>
                </div>
              </div>
              <span class="slot-tag">Comforting Night Meal</span>
            </div>

            <div class="meal-slot-items">
              <div class="menu-item-row" *ngIf="currentDayMenu.dinner.main">
                <div class="item-icon-box">🍲</div>
                <div class="item-detail">
                  <span class="item-label">Main Sabzi</span>
                  <span class="item-name">{{ currentDayMenu.dinner.main }}</span>
                </div>
              </div>

              <div class="menu-item-row" *ngIf="currentDayMenu.dinner.dal">
                <div class="item-icon-box">🥣</div>
                <div class="item-detail">
                  <span class="item-label">Dal / Gravy</span>
                  <span class="item-name">{{ currentDayMenu.dinner.dal }}</span>
                </div>
              </div>

              <div class="menu-item-row" *ngIf="currentDayMenu.dinner.breadRice">
                <div class="item-icon-box">🫓</div>
                <div class="item-detail">
                  <span class="item-label">Breads & Rice</span>
                  <span class="item-name">{{ currentDayMenu.dinner.breadRice }}</span>
                </div>
              </div>

              <div class="menu-item-row" *ngIf="currentDayMenu.dinner.sides">
                <div class="item-icon-box">🥗</div>
                <div class="item-detail">
                  <span class="item-label">Accompaniments</span>
                  <span class="item-name">{{ currentDayMenu.dinner.sides }}</span>
                </div>
              </div>
            </div>

            <!-- ACTION FOOTER: PRICE & ADD TO CART -->
            <div class="meal-slot-footer">
              <div class="meal-price-wrap">
                <span class="price-currency">₹</span>
                <span class="price-amount">{{ currentDayMenu.dinner.price || 89 }}</span>
                <span class="price-sub">/ hot meal</span>
              </div>
              <button type="button" 
                      class="btn-slot-cart" 
                      (click)="addMealToCart(currentDayMenu.day, 'dinner', currentDayMenu.dinner)">
                <span>+</span> Add to Cart
              </button>
            </div>
          </div>

        </div>

        <div class="weekly-footer-note text-center" style="margin-top: 1.5rem; color: #64748b; font-size: 0.88rem;">
          <p>ℹ️ <em>100% Pure Jain and No-Onion-No-Garlic options are freshly prepared daily upon request.</em></p>
        </div>

        <div class="text-center" style="margin-top: 2rem;" *ngIf="section.buttonText || true">
          <a [routerLink]="section.buttonLink || '/tiffin'" class="btn-order-today">
            {{ section.buttonText || 'Order Today\\'s Special Thali' }} →
          </a>
        </div>

      </div>

      <!-- Toast message when meal added to cart -->
      <div class="cart-toast animate-slide-up" *ngIf="cartToastMessage">
        {{ cartToastMessage }}
      </div>
    </section>
  `,
  styles: [`
    .cms-weekly-menu-section {
      width: 100%;
      position: relative;
    }
    .container {
      margin: 0 auto;
      padding: 0 1.25rem;
    }
    .section-header {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      text-align: center !important;
      margin-bottom: 2.5rem;
    }
    .section-tag {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #ea580c;
      background: #ffedd5;
      padding: 0.35rem 0.85rem;
      border-radius: 50px;
      margin-bottom: 0.75rem;
    }
    .section-title {
      display: block !important;
      width: 100%;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 0.75rem;
      letter-spacing: -0.5px;
      text-align: center;
    }
    :host ::ng-deep .section-title span {
      color: #ea580c !important;
    }
    .section-desc {
      display: block;
      font-size: 1rem;
      color: #64748b;
      max-width: 650px;
      margin: 0 auto 1.5rem;
      line-height: 1.6;
      text-align: center;
    }

    .days-tab-scroller {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 8px 4px 14px;
      justify-content: center;
      max-width: 100%;
    }
    .day-pill-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 20px;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.25s ease;
      min-width: 80px;
    }
    .day-pill-btn:hover {
      border-color: #ea580c;
      background: #fff8f5;
    }
    .day-pill-btn.active {
      background: #ea580c;
      border-color: #ea580c;
      box-shadow: 0 4px 15px rgba(234, 88, 12, 0.35);
    }
    .day-name {
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
    }
    .day-full {
      font-size: 0.9rem;
      font-weight: 700;
      color: #1e293b;
    }
    .day-pill-btn.active .day-name,
    .day-pill-btn.active .day-full {
      color: white;
    }

    .day-menu-cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-top: 1rem;
    }
    @media (max-width: 768px) {
      .day-menu-cards-grid {
        grid-template-columns: 1fr;
      }
    }
    .meal-slot-card {
      background: white;
      border-radius: 20px;
      padding: 1.75rem;
      border: 1.5px solid #e2e8f0;
      box-shadow: 0 8px 25px rgba(0,0,0,0.04);
      transition: transform 0.25s ease;
    }
    .meal-slot-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.08);
      border-color: #fed7aa;
    }
    .meal-slot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1.5px dashed #f1f5f9;
    }
    .slot-title-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .slot-icon {
      font-size: 1.8rem;
    }
    .slot-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 2px;
    }
    .slot-time {
      font-size: 0.78rem;
      color: #64748b;
    }
    .slot-tag {
      font-size: 0.72rem;
      font-weight: 700;
      background: #ffedd5;
      color: #ea580c;
      padding: 4px 10px;
      border-radius: 30px;
    }
    .meal-slot-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .menu-item-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 8px 12px;
      background: #faf7f2;
      border-radius: 12px;
    }
    .item-icon-box {
      font-size: 1.4rem;
    }
    .item-detail {
      display: flex;
      flex-direction: column;
    }
    .item-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 0.5px;
    }
    .item-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: #1e293b;
    }
    .btn-order-today {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #ea580c;
      color: white;
      font-weight: 700;
      font-size: 1rem;
      padding: 12px 28px;
      border-radius: 50px;
      text-decoration: none;
      box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3);
      transition: all 0.25s ease;
    }
    .btn-order-today:hover {
      background: #c2410c;
      transform: translateY(-2px);
    }
    .meal-slot-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1.5px dashed #f1f5f9;
      flex-wrap: wrap;
      gap: 10px;
    }
    .meal-price-wrap {
      display: flex;
      align-items: baseline;
      gap: 3px;
    }
    .price-currency {
      font-size: 1.1rem;
      font-weight: 800;
      color: #ea580c;
    }
    .price-amount {
      font-size: 1.7rem;
      font-weight: 900;
      color: #1e293b;
      line-height: 1;
    }
    .price-sub {
      font-size: 0.78rem;
      color: #94a3b8;
      font-weight: 600;
      margin-left: 2px;
    }
    .btn-slot-cart {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #0d9488;
      color: white;
      font-weight: 800;
      font-size: 0.92rem;
      padding: 10px 20px;
      border-radius: 50px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.25);
      transition: all 0.25s ease;
    }
    .btn-slot-cart:hover {
      background: #0f766e;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(13, 148, 136, 0.35);
    }
    .btn-slot-cart span {
      font-size: 1.2rem;
      line-height: 0.8;
      font-weight: 900;
    }
    .cart-toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #0f172a;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      font-weight: 700;
      font-size: 0.95rem;
      z-index: 99999;
      display: flex;
      align-items: center;
      gap: 10px;
      border-left: 4px solid #10b981;
    }
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-slide-up {
      animation: slideUp 0.3s ease-out forwards;
    }
  `]
})
export class CmsWeeklyMenuComponent implements OnInit {
  @Input() section!: CmsSection;

  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  activeDayIndex = 0;
  weeklyMenu: DayMenu[] = [];

  private tiffinService = inject(TiffinService);
  private cartService = inject(CartService);
  private cdr = inject(ChangeDetectorRef);

  cartToastMessage = '';

  addMealToCart(day: string, slotType: 'lunch' | 'dinner', meal: any) {
    if (!meal) return;
    const slotTitle = slotType === 'lunch' ? 'Lunch Spread' : 'Dinner Spread';
    const mainItem = meal.main || 'Homestyle Special';
    const mealTitle = `${day} ${slotTitle} (${mainItem})`;
    const price = meal.price && Number(meal.price) > 0 ? Number(meal.price) : (slotType === 'lunch' ? 99 : 89);
    
    const itemsList = [meal.main, meal.dal, meal.breadRice, meal.sides].filter(Boolean).join(', ');

    const recipe: Recipe = {
      id: Math.abs(this.hashCode(`${day}-${slotType}-${price}`)),
      _id: `meal-${day.toLowerCase()}-${slotType}`,
      slug: `daily-meal-${day.toLowerCase()}-${slotType}`,
      title: mealTitle,
      description: `Includes: ${itemsList}. Freshly cooked with 100% RO water & desi ghee.`,
      introduction: `${day} ${slotTitle}: ${itemsList}`,
      price: price,
      image: slotType === 'lunch'
        ? 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      imageAlt: mealTitle,
      category: 'Thalis And Mini Meals',
      cuisine: 'North Indian',
      isVeg: true,
      inStock: true,
      prepTime: '20 mins',
      cookTime: '30 mins',
      totalTime: '50 mins',
      servings: 1,
      difficulty: 'Easy',
      ingredients: [meal.main, meal.dal, meal.breadRice, meal.sides].filter(Boolean),
      instructions: ['Prepared fresh and delivered hot in sanitized packaging'],
      tips: ['Enjoy hot within 2 hours of delivery'],
      seoTitle: mealTitle,
      seoDescription: itemsList
    };

    this.cartService.addToCart(recipe);
    this.showToast(`🍱 "${mealTitle}" (₹${price}) added to cart!`);
  }

  showToast(msg: string) {
    this.cartToastMessage = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.cartToastMessage = '';
      this.cdr.detectChanges();
    }, 3500);
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash;
  }

  ngOnInit() {
    const today = new Date().getDay(); // 0 is Sun, 1 is Mon...
    this.activeDayIndex = today === 0 ? 6 : today - 1;

    this.tiffinService.getConfig().subscribe({
      next: (cfg) => {
        if (cfg?.weeklyMenu?.length) {
          this.weeklyMenu = cfg.weeklyMenu;
        } else {
          this.weeklyMenu = this.getFallbackWeeklyMenu();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.weeklyMenu = this.getFallbackWeeklyMenu();
        this.cdr.detectChanges();
      }
    });
  }

  get currentDayMenu(): DayMenu | undefined {
    const dayName = this.daysOfWeek[this.activeDayIndex];
    return this.weeklyMenu.find(m => m.day.toLowerCase() === dayName.toLowerCase()) || this.weeklyMenu[0];
  }

  private getFallbackWeeklyMenu(): DayMenu[] {
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
}

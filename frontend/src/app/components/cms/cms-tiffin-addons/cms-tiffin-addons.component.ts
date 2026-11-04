import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CmsSection } from '../../../models/cms.model';
import { TiffinService } from '../../../services/tiffin.service';
import { CartService } from '../../../services/cart.service';
import { Recipe } from '../../../services/recipe.service';

export interface AddonItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
}

@Component({
  selector: 'app-cms-tiffin-addons',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="cms-addons-section"
             [class.is-light-text]="section.style?.textColor === '#ffffff'"
             [style.padding-top]="section.style?.paddingTop || '60px'"
             [style.padding-bottom]="section.style?.paddingBottom || '60px'"
             [style.background-color]="section.style?.backgroundColor || '#ffffff'"
             [style.background]="section.style?.backgroundGradient || section.style?.backgroundColor || '#ffffff'"
             [style.color]="section.style?.textColor || 'inherit'">
      <div class="container" [style.max-width]="section.style?.maxWidth || '1200px'">

        <!-- Toast Feedback -->
        <div *ngIf="toastMsg" class="cart-toast-banner animate-slide-down">
          <span>✅ {{ toastMsg }}</span>
          <button type="button" class="btn-toast-view" (click)="goToCart()">View Cart →</button>
        </div>

        <div class="section-header text-center animate-fade-in">
          <div *ngIf="section.badge || 'Extra Delights'" class="section-tag">
            {{ section.badge || 'Extra Delights' }}
          </div>

          <h2 class="section-title"
              [style.color]="section.style?.textColor || '#1e293b'"
              [style.font-size]="section.style?.titleFontSize || '36px'"
              [innerHTML]="section.title || 'Add-ons & Meal Accompaniments'">
          </h2>

          <p class="section-desc"
             [style.color]="section.style?.textColor ? (section.style?.textColor === '#ffffff' ? 'rgba(255,255,255,0.85)' : section.style?.textColor) : '#64748b'"
             [innerHTML]="section.subtitle || 'Customize your daily box with warm desi ghee rotis, chilled raita, sweet dishes, and extra curries.'">
          </p>
        </div>

        <div class="addons-cards-grid">
          <div *ngFor="let addon of addons" class="addon-card">
            <div class="addon-icon">🍛</div>
            <div class="addon-main">
              <span class="addon-category">{{ addon.category }}</span>
              <h3 class="addon-name">{{ addon.name }}</h3>
              <p class="addon-desc">{{ addon.description }}</p>
              <div class="addon-price">₹{{ addon.price }}</div>
            </div>
            <button type="button" class="btn-add-cart" (click)="addToCart(addon)">
              + Add to Cart
            </button>
          </div>
        </div>

      </div>
    </section>
  `,
  styles: [`
    .cms-addons-section {
      width: 100%;
      position: relative;
    }
    .container {
      margin: 0 auto;
      padding: 0 1.25rem;
    }
    .cart-toast-banner {
      position: fixed;
      top: 90px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      background: #1e293b;
      color: white;
      padding: 10px 22px;
      border-radius: 50px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    }
    .btn-toast-view {
      background: #ea580c;
      color: white;
      border: none;
      border-radius: 50px;
      padding: 5px 14px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
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
    .addons-cards-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }
    @media (max-width: 992px) {
      .addons-cards-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 560px) {
      .addons-cards-grid {
        grid-template-columns: 1fr;
      }
    }
    .addon-card {
      background: #faf7f2;
      border: 1.5px solid #fed7aa;
      border-radius: 18px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      transition: all 0.25s ease;
    }
    .addon-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(234, 88, 12, 0.1);
      background: white;
    }
    .addon-icon {
      font-size: 2rem;
      margin-bottom: 0.75rem;
    }
    .addon-category {
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      color: #ea580c;
      background: #ffedd5;
      padding: 2px 8px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 0.5rem;
    }
    .addon-name {
      font-size: 1.05rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 0.35rem;
    }
    .addon-desc {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0 0 1rem;
      flex: 1;
      line-height: 1.4;
    }
    .addon-price {
      font-size: 1.3rem;
      font-weight: 800;
      color: #ea580c;
      margin-bottom: 1rem;
    }
    .btn-add-cart {
      width: 100%;
      background: white;
      border: 1.5px solid #ea580c;
      color: #ea580c;
      padding: 9px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-add-cart:hover {
      background: #ea580c;
      color: white;
    }
  `]
})
export class CmsTiffinAddonsComponent implements OnInit {
  @Input() section!: CmsSection;

  addons: AddonItem[] = [
    { id: 'ad-extra-roti', name: '2 Extra Desi Ghee Phulkas', category: 'Breads', price: 20, description: '100% Whole wheat soft rotis' },
    { id: 'ad-extra-curd', name: 'Fresh Dahi / Boondi Raita', category: 'Sides & Drinks', price: 25, description: 'Chilled homestyle curd' },
    { id: 'ad-sweet-gulab', name: 'Gulab Jamun (2 Pcs)', category: 'Desserts & Sweets', price: 35, description: 'Warm desi ghee gulab jamun' },
    { id: 'ad-paneer-portion', name: 'Extra Paneer Sabzi Cup', category: 'Curries & Dals', price: 50, description: 'Rich gravy paneer portion' }
  ];

  toastMsg = '';
  private tiffinService = inject(TiffinService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.tiffinService.getConfig().subscribe(cfg => {
      if (cfg?.addons?.length) {
        this.addons = cfg.addons;
        this.cdr.detectChanges();
      }
    });
  }

  addToCart(addon: AddonItem) {
    const addonRecipe: Recipe = {
      id: Math.floor(1000 + Math.random() * 9000),
      _id: addon.id,
      slug: addon.id,
      title: `${addon.name} (Addon)`,
      description: addon.description,
      introduction: addon.description,
      price: addon.price,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80',
      imageAlt: addon.name,
      category: 'Thalis And Mini Meals',
      cuisine: 'North Indian',
      isVeg: true,
      inStock: true,
      prepTime: '10 mins',
      cookTime: '5 mins',
      totalTime: '15 mins',
      servings: 1,
      difficulty: 'Easy',
      ingredients: [addon.name],
      instructions: [],
      tips: [],
      seoTitle: addon.name,
      seoDescription: addon.description
    };

    this.cartService.addToCart(addonRecipe);
    this.toastMsg = `Added "${addon.name}" to cart!`;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMsg = '';
      this.cdr.detectChanges();
    }, 3500);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}

import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsSection } from '../../../models/cms.model';
import { RecipeService } from '../../../services/recipe.service';

@Component({
  selector: 'app-cms-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="cms-categories-section"
             [class.is-light-text]="section.style.textColor === '#ffffff'"
             [style.padding-top]="section.style.paddingTop || '60px'"
             [style.padding-bottom]="section.style.paddingBottom || '60px'"
             [style.background-color]="section.style.backgroundColor || 'var(--background-light)'"
             [style.background]="section.style.backgroundGradient || section.style.backgroundColor || 'var(--background-light)'"
             [style.color]="section.style.textColor || 'inherit'">
      <div class="container" [style.max-width]="section.style.maxWidth || '1200px'">
        
        <!-- Header -->
        <div class="text-center animate-fade-in" style="margin-bottom: 2.5rem;">
          <div *ngIf="section.badge" class="cms-badge">
            {{ section.badge }}
          </div>
          <h2 *ngIf="section.title" class="section-title"
              [style.color]="section.style.textColor || 'var(--secondary-color, #241814)'"
              [style.font-size]="section.style.titleFontSize || '36px'"
              [innerHTML]="section.title">
          </h2>
          <p *ngIf="section.subtitle" class="section-subtitle"
             [style.color]="section.style.textColor ? (section.style.textColor === '#ffffff' ? 'rgba(255,255,255,0.85)' : section.style.textColor) : 'var(--text-light, #716661)'"
             [style.font-size]="section.style.contentFontSize || '16px'">
            {{ section.subtitle }}
          </p>
        </div>

        <!-- Categories Grid -->
        <div class="category-grid" 
             [style.grid-template-columns]="'repeat(' + (section.style.gridColumns || 4) + ', 1fr)'"
             [style.gap]="section.style.gridGap || '20px'">
          <a *ngFor="let cat of categories; trackBy: trackBySlug" 
             [routerLink]="['/category', cat.slug]" 
             class="category-card"
             [style.border-radius]="section.style.borderRadius || '16px'">
            <div class="category-icon-box">
              <img *ngIf="cat.image" [src]="cat.image" [alt]="cat.name" class="category-icon-img">
              <span *ngIf="!cat.image && isEmoji(cat.icon)" class="category-emoji">{{ cat.icon }}</span>
              <i *ngIf="!cat.image && !isEmoji(cat.icon)" [class]="cat.icon || 'fa-solid fa-utensils'"></i>
            </div>
            <h3>{{ cat.name }}</h3>
            <p *ngIf="cat.description" class="category-desc">{{ cat.description }}</p>
          </a>
        </div>

        <div *ngIf="section.buttonText" class="text-center" style="margin-top: 2.5rem;">
          <a [routerLink]="section.buttonLink || '/menu'" class="btn btn-primary">
            {{ section.buttonText }}
          </a>
        </div>

      </div>
    </section>
  `,
  styles: [`
    .cms-categories-section {
      width: 100%;
      position: relative;
    }
    .cms-badge {
      display: inline-flex;
      align-items: center;
      padding: 6px 16px;
      background: var(--primary-light, #fff5ed);
      color: var(--primary-color, #ea580c);
      border: 1.5px solid var(--primary-border, #fed7aa);
      border-radius: 50px;
      font-weight: 700;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
    }
    .section-title {
      font-weight: 800;
      color: var(--secondary-color, #241814);
      margin-bottom: 0.5rem;
    }
    :host ::ng-deep .section-title span {
      color: var(--primary-color, #ea580c);
    }
    .section-subtitle {
      color: var(--text-light, #716661);
      max-width: 650px;
      margin: 0 auto;
      line-height: 1.5;
    }
    .category-grid {
      display: grid;
    }
    .category-card {
      background: #ffffff;
      padding: 1.75rem 1.25rem;
      border-radius: 16px;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 14px rgba(36, 24, 20, 0.05);
      border: 1px solid rgba(237, 226, 216, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      color: inherit;
    }
    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 24px rgba(249, 95, 0, 0.16);
      border-color: var(--primary-border, #fed7aa);
    }
    .category-icon-box {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--primary-light, #fff5ed);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      font-size: 1.8rem;
      color: var(--primary-color, #ea580c);
      overflow: hidden;
    }
    .category-icon-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .category-emoji {
      font-size: 2rem;
    }
    .category-card h3 {
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
      color: var(--secondary-color, #241814);
    }
    .category-desc {
      font-size: 0.85rem;
      color: var(--text-light, #716661);
      line-height: 1.4;
      margin: 0;
    }
    @media (max-width: 992px) {
      .category-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
    }
    @media (max-width: 480px) {
      .category-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `]
})
export class CmsCategoriesComponent implements OnInit {
  @Input() section!: CmsSection;

  categories: any[] = [];
  private recipeService = inject(RecipeService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.recipeService.getCategories().subscribe(cats => {
      this.categories = cats;
      this.cdr.detectChanges();
    });
  }

  isEmoji(str?: string): boolean {
    if (!str) return false;
    return !str.includes('fa-') && str.length <= 4;
  }

  trackBySlug(index: number, cat: any): string {
    return cat.slug || index.toString();
  }
}

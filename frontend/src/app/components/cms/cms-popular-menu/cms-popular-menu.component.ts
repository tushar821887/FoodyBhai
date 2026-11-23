import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsSection } from '../../../models/cms.model';
import { RecipeService, Recipe } from '../../../services/recipe.service';
import { MenuCard } from '../../menu-card/menu-card';

@Component({
  selector: 'app-cms-popular-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuCard],
  template: `
    <section class="cms-popular-menu-section"
             [class.is-light-text]="section.style.textColor === '#ffffff'"
             [style.padding-top]="section.style.paddingTop || '60px'"
             [style.padding-bottom]="section.style.paddingBottom || '60px'"
             [style.background-color]="section.style.backgroundColor || 'transparent'"
             [style.background]="section.style.backgroundGradient || section.style.backgroundColor || 'transparent'"
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

        <!-- Skeletons while loading from API -->
        <div *ngIf="isLoading" class="menu-grid" 
             [style.grid-template-columns]="'repeat(' + (section.style.gridColumns || 4) + ', 1fr)'"
             [style.gap]="section.style.gridGap || '24px'">
          <div *ngFor="let s of [1,2,3,4]" style="background: white; border-radius: 12px; padding: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); height: 260px; display: flex; flex-direction: column; gap: 12px;">
            <div style="background: #f1f5f9; height: 140px; border-radius: 8px; animation: cmsPulse 1.5s infinite ease-in-out;"></div>
            <div style="background: #f1f5f9; height: 18px; width: 75%; border-radius: 4px; animation: cmsPulse 1.5s infinite ease-in-out;"></div>
            <div style="background: #f1f5f9; height: 14px; width: 45%; border-radius: 4px; animation: cmsPulse 1.5s infinite ease-in-out;"></div>
          </div>
        </div>

        <!-- Menu Grid from Live API -->
        <div *ngIf="!isLoading && popularItems.length > 0" class="menu-grid" 
             [style.grid-template-columns]="'repeat(' + (section.style.gridColumns || 4) + ', 1fr)'"
             [style.gap]="section.style.gridGap || '24px'">
          <app-menu-card *ngFor="let item of popularItems; trackBy: trackById" [item]="item"></app-menu-card>
        </div>

        <!-- CTA Action -->
        <div *ngIf="section.buttonText" class="text-center" style="margin-top: 3rem;">
          <a [routerLink]="section.buttonLink || '/menu'" class="btn btn-primary">
            {{ section.buttonText }}
          </a>
        </div>

      </div>
    </section>
  `,
  styles: [`
    .cms-popular-menu-section {
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
    .menu-grid {
      display: grid;
    }
    @media (max-width: 1024px) {
      .menu-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
    }
    @media (max-width: 540px) {
      .menu-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `]
})
export class CmsPopularMenuComponent implements OnInit {
  @Input() section!: CmsSection;

  popularItems: Recipe[] = [];
  isLoading = true;
  private recipeService = inject(RecipeService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.recipeService.getRecipes().subscribe({
      next: items => {
        this.isLoading = false;
        const count = (this.section.style.gridColumns || 4) * 2;
        this.popularItems = (items || []).slice(0, count || 4);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  trackById(index: number, item: any): string {
    return item.id || item._id || index.toString();
  }
}

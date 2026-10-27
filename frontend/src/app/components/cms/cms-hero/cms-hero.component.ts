import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsSection } from '../../../models/cms.model';

@Component({
  selector: 'app-cms-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="hero"
             [class.is-light-text]="section.style.textColor === '#ffffff'"
             [style.padding-top]="section.style.paddingTop || '3rem'"
             [style.padding-bottom]="section.style.paddingBottom || '4rem'"
             [style.background-color]="section.style.backgroundColor || 'transparent'"
             [style.background]="section.style.backgroundGradient || section.style.backgroundColor || 'transparent'"
             [style.color]="section.style.textColor || 'inherit'">
      <div class="container hero-container" [style.max-width]="section.style.maxWidth || '1200px'">
        <div class="hero-content animate-fade-in">
          
          <!-- Badges (strictly from CMS) -->
          <div class="hero-badges" *ngIf="section.badge || section.badge2">
            <div class="badge delivery-badge" *ngIf="section.badge">
              <i class="fa-solid fa-motorcycle"></i> {{ section.badge }}
            </div>
            <div class="badge delivery-badge area-badge" *ngIf="section.badge2">
              <i class="fa-solid fa-location-dot"></i> {{ section.badge2 }}
            </div>
          </div>

          <!-- Dynamic Title (strictly from CMS) -->
          <h1 *ngIf="section.title"
              class="hero-title"
              [style.color]="section.style.textColor || 'var(--secondary-color, #241814)'"
              [style.font-size]="section.style.titleFontSize || '3.5rem'"
              [innerHTML]="section.title"></h1>

          <!-- Dynamic Subtitle (strictly from CMS) -->
          <p *ngIf="section.subtitle"
             class="hero-subtitle"
             [style.color]="section.style.textColor ? (section.style.textColor === '#ffffff' ? 'rgba(255,255,255,0.85)' : section.style.textColor) : 'var(--text-light, #716661)'"
             [style.font-size]="section.style.contentFontSize || '1.1rem'">
            {{ section.subtitle }}
          </p>

          <!-- Action Buttons (strictly from CMS) -->
          <div class="hero-actions" *ngIf="section.buttonText || section.secondaryButtonText || section.zomatoLink || section.swiggyLink" style="flex-wrap: wrap; gap: 1rem;">
            <a *ngIf="section.buttonText" [routerLink]="section.buttonLink || '/menu'" class="btn btn-primary btn-lg">
              {{ section.buttonText }} <i class="fa-solid fa-arrow-right"></i>
            </a>
            <a *ngIf="section.secondaryButtonText" [routerLink]="section.secondaryButtonLink || '/page/offers'" class="btn btn-secondary btn-lg">
              {{ section.secondaryButtonText }}
            </a>
            <a *ngIf="section.zomatoLink" [href]="section.zomatoLink" target="_blank" class="btn btn-lg btn-zomato">
              <strong style="font-style: italic; font-weight: 800; font-size: 1.15rem; letter-spacing: 0.5px;">zomato</strong>
            </a>
            <a *ngIf="section.swiggyLink" [href]="section.swiggyLink" target="_blank" class="btn btn-lg btn-swiggy">
              <strong style="font-weight: 800; font-size: 1.15rem; letter-spacing: 0.5px;">SWIGGY</strong>
            </a>
          </div>

          <!-- Quick Stats (strictly from CMS items) -->
          <div class="hero-stats" *ngIf="section.items && section.items.length > 0">
            <div class="stat" *ngFor="let item of section.items">
              <span class="stat-number">
                {{ item.title }}
                <i *ngIf="item.icon && item.icon.includes('fa-')" [class]="item.icon" style="color: #f59e0b; font-size: 0.8em;"></i>
              </span>
              <span class="stat-text" *ngIf="item.description">{{ item.description }}</span>
            </div>
          </div>
        </div>

        <!-- Hero Image Slice (strictly from CMS) -->
        <div class="hero-image animate-fade-in" *ngIf="section.imageUrl" style="animation-delay: 0.2s">
          <div class="img-wrapper" [style.border-radius]="section.style.borderRadius || '30px'">
            <img [src]="section.imageUrl" [alt]="section.title || 'Foody Bhai'">
            
            <div class="floating-card rating-card" *ngIf="section.ratingValue || section.ratingLabel">
              <i class="fa-solid fa-star" style="color: #f59e0b; font-size: 24px;"></i>
              <div>
                <strong *ngIf="section.ratingValue" style="display: block; font-size: 18px; color: #1e293b;">{{ section.ratingValue }}</strong>
                <span *ngIf="section.ratingLabel" style="font-size: 12px; color: #64748b;">{{ section.ratingLabel }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  `,
  styles: [`
    .hero {
      position: relative;
      overflow: hidden;
      width: 100%;
    }
    .hero-container {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 3.5rem;
      align-items: center;
    }
    .hero-badges {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }
    .delivery-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1rem;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 600;
      background: #f0fdf4;
      color: #16a34a;
      border: 1px solid #bbf7d0;
    }
    .area-badge {
      background: var(--primary-light, #fff5ed);
      color: var(--primary-color, #ea580c);
      border-color: var(--primary-border, #fed7aa);
    }
    .hero-title {
      font-size: 3.5rem;
      line-height: 1.15;
      margin-bottom: 1.25rem;
      font-weight: 800;
      color: var(--secondary-color, #241814);
    }
    :host ::ng-deep .hero-title span {
      color: var(--primary-color, #ea580c);
    }
    :host ::ng-deep .hero.is-light-text .hero-title span,
    .hero.is-light-text :host ::ng-deep .hero-title span {
      color: #fde047 !important;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    }
    .hero.is-light-text .stat-number {
      color: #ffffff !important;
    }
    .hero.is-light-text .stat-text {
      color: rgba(255, 255, 255, 0.8) !important;
    }
    .hero-subtitle {
      font-size: 1.1rem;
      color: var(--text-light, #716661);
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    .hero-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2.5rem;
    }
    .btn-zomato {
      background: #e23744;
      color: white;
      border: none;
      box-shadow: 0 4px 15px rgba(226, 55, 68, 0.3);
    }
    .btn-swiggy {
      background: #fc8019;
      color: white;
      border: none;
      box-shadow: 0 4px 15px rgba(252, 128, 25, 0.3);
    }
    .hero-stats {
      display: flex;
      gap: 2.5rem;
      border-top: 1px solid var(--border-color, #ede2d8);
      padding-top: 1.5rem;
    }
    .stat {
      display: flex;
      flex-direction: column;
    }
    .stat-number {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--secondary-color, #241814);
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    .stat-text {
      font-size: 0.85rem;
      color: var(--text-light, #716661);
    }
    .img-wrapper {
      position: relative;
      border-radius: 30px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }
    .img-wrapper img {
      width: 100%;
      height: 100%;
      max-height: 480px;
      object-fit: cover;
      display: block;
    }
    .floating-card {
      position: absolute;
      bottom: 20px;
      left: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      background: white;
      padding: 10px 16px;
      border-radius: 14px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
    }
    @media (max-width: 992px) {
      .hero-container {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      .hero-title {
        font-size: 2.4rem;
      }
    }
    @media (max-width: 576px) {
      .hero-title {
        font-size: 2rem;
      }
      .hero-actions {
        flex-direction: column;
        align-items: stretch;
      }
      .hero-actions .btn {
        width: 100%;
        text-align: center;
      }
      .hero-stats {
        gap: 1.25rem;
        flex-wrap: wrap;
      }
    }
  `]
})
export class CmsHeroComponent {
  @Input() section!: CmsSection;
}

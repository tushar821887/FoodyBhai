import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsSection } from '../../../models/cms.model';

@Component({
  selector: 'app-cms-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cms-banner-wrapper"
         [class.is-light-text]="section.style.textColor === '#ffffff'"
         [style.padding-top]="section.style.paddingTop || '60px'"
         [style.padding-bottom]="section.style.paddingBottom || '60px'"
         [style.background-color]="section.style.backgroundColor || 'transparent'"
         [style.background]="section.style.backgroundGradient || section.style.backgroundColor || 'transparent'"
         [style.color]="section.style.textColor || 'inherit'">
      
      <div class="container" [style.max-width]="section.style.maxWidth || '1200px'">
        <div class="cms-split-grid" [class.image-left]="section.imagePosition === 'left'">
          
          <div class="cms-banner-text" [style.text-align]="section.style.textAlign || 'left'">
            <span *ngIf="section.badge" class="cms-badge">{{ section.badge }}</span>
            <h2 class="cms-banner-title"
                [style.color]="section.style.textColor || 'var(--secondary-color, #241814)'"
                [style.font-size]="section.style.titleFontSize || '36px'"
                [innerHTML]="section.title">
            </h2>
            <p class="cms-banner-desc"
               [style.color]="section.style.textColor ? (section.style.textColor === '#ffffff' ? 'rgba(255,255,255,0.85)' : section.style.textColor) : 'var(--text-light, #716661)'"
               [style.font-size]="section.style.contentFontSize || '16px'">
              {{ section.subtitle || section.content }}
            </p>
            <div *ngIf="section.buttonText" class="cms-banner-actions">
              <a [routerLink]="section.buttonLink || '/menu'" class="btn btn-primary btn-lg">
                {{ section.buttonText }}
              </a>
            </div>
          </div>

          <div *ngIf="section.imageUrl" class="cms-banner-image">
            <div class="image-box" [style.border-radius]="section.style.borderRadius || '16px'">
              <img [src]="section.imageUrl" [alt]="section.title || 'Banner'" onerror="this.src='https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80'">
            </div>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .cms-banner-wrapper { width: 100%; }
    .cms-split-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: 3rem;
    }
    .cms-split-grid.image-left {
      grid-template-columns: 1fr 1fr;
    }
    .cms-split-grid.image-left .cms-banner-text { order: 2; }
    .cms-split-grid.image-left .cms-banner-image { order: 1; }
    .cms-badge {
      display: inline-block;
      padding: 4px 14px;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 700;
      background: var(--primary-light, #fff5ed);
      color: var(--primary-color, #ea580c);
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .cms-banner-title {
      font-weight: 800;
      line-height: 1.2;
      color: var(--secondary-color, #241814);
      margin-bottom: 1rem;
    }
    :host ::ng-deep .cms-banner-title span {
      color: var(--primary-color, #ea580c);
    }
    .cms-banner-desc {
      color: var(--text-light, #716661);
      line-height: 1.6;
      margin-bottom: 1.75rem;
    }
    .image-box {
      overflow: hidden;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
    }
    .image-box img {
      width: 100%;
      height: 100%;
      max-height: 400px;
      object-fit: cover;
      display: block;
    }
    @media (max-width: 900px) {
      .cms-split-grid {
        grid-template-columns: 1fr !important;
        gap: 2rem;
      }
      .cms-split-grid.image-left .cms-banner-text { order: 1; }
      .cms-split-grid.image-left .cms-banner-image { order: 2; }
    }
  `]
})
export class CmsBannerComponent {
  @Input() section!: CmsSection;
}

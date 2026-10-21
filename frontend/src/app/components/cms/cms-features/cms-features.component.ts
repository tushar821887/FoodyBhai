import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsSection } from '../../../models/cms.model';

@Component({
  selector: 'app-cms-features',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cms-features-wrapper"
         [class.is-light-text]="section.style.textColor === '#ffffff'"
         [style.padding-top]="section.style.paddingTop || '60px'"
         [style.padding-bottom]="section.style.paddingBottom || '60px'"
         [style.background-color]="section.style.backgroundColor || 'transparent'"
         [style.background]="section.style.backgroundGradient || section.style.backgroundColor || 'transparent'"
         [style.color]="section.style.textColor || 'inherit'">

      <div class="container" [style.max-width]="section.style.maxWidth || '1200px'">
        
        <!-- Header -->
        <div class="cms-features-header" [style.text-align]="section.style.textAlign || 'center'">
          <h2 class="cms-section-title"
              [style.color]="section.style.textColor || 'var(--secondary-color, #241814)'"
              [style.font-size]="section.style.titleFontSize || '36px'"
              [innerHTML]="section.title">
          </h2>
          <p *ngIf="section.subtitle" class="cms-section-subtitle"
             [style.color]="section.style.textColor ? (section.style.textColor === '#ffffff' ? 'rgba(255,255,255,0.85)' : section.style.textColor) : 'var(--text-light, #716661)'"
             [style.font-size]="section.style.contentFontSize || '16px'">
            {{ section.subtitle }}
          </p>
        </div>

        <!-- Grid Cards -->
        <div class="cms-features-grid" 
             [style.grid-template-columns]="'repeat(' + (section.style.gridColumns || 3) + ', 1fr)'"
             [style.gap]="section.style.gridGap || '24px'">
          
          <div *ngFor="let item of section.items" class="cms-feature-card" [style.border-radius]="section.style.borderRadius || '16px'">
            <div class="cms-feature-icon-box">
              <span class="feature-icon-text">{{ item.icon || '✨' }}</span>
            </div>
            <h3 class="cms-feature-title">{{ item.title }}</h3>
            <p class="cms-feature-desc">{{ item.description }}</p>
            <a *ngIf="item.link" [routerLink]="item.link" class="cms-feature-link">Learn More →</a>
          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    .cms-features-wrapper {
      width: 100%;
    }
    .cms-features-header {
      margin-bottom: 2.5rem;
    }
    .cms-section-title {
      font-weight: 800;
      color: var(--secondary-color, #241814);
      margin-bottom: 0.5rem;
    }
    :host ::ng-deep .cms-section-title span {
      color: var(--primary-color, #ea580c);
    }
    .cms-section-subtitle {
      color: var(--text-light, #716661);
      max-width: 650px;
      margin: 0 auto;
      line-height: 1.5;
    }
    .cms-features-grid {
      display: grid;
    }
    .cms-feature-card {
      background: var(--background-white, #ffffff);
      padding: 2rem 1.5rem;
      border: 1.5px solid var(--border-color, #ede2d8);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      text-align: center;
      transition: all 0.25s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .cms-feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 24px var(--primary-glow, rgba(249, 95, 0, 0.15));
      border-color: var(--primary-border, #fed7aa);
    }
    .cms-feature-icon-box {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--primary-light, #fff5ed);
      border: 1.5px solid var(--primary-border, #fed7aa);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      margin-bottom: 1.25rem;
      color: var(--primary-color, #ea580c);
    }
    .cms-feature-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--secondary-color, #241814);
      margin-bottom: 0.5rem;
    }
    .cms-feature-desc {
      font-size: 0.92rem;
      color: var(--text-light, #716661);
      line-height: 1.5;
      margin: 0;
    }
    .cms-feature-link {
      margin-top: 1rem;
      color: var(--primary-color, #ea580c);
      font-weight: 700;
      font-size: 0.88rem;
      text-decoration: none;
    }
    @media (max-width: 900px) {
      .cms-features-grid {
        grid-template-columns: 1fr !important;
        gap: 1rem !important;
      }
    }
  `]
})
export class CmsFeaturesComponent {
  @Input() section!: CmsSection;
}

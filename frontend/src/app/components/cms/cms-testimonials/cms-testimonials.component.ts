import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsSection } from '../../../models/cms.model';

@Component({
  selector: 'app-cms-testimonials',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cms-testimonials-wrapper"
         [class.is-light-text]="section.style.textColor === '#ffffff'"
         [style.padding-top]="section.style.paddingTop || '60px'"
         [style.padding-bottom]="section.style.paddingBottom || '60px'"
         [style.background-color]="section.style.backgroundColor || 'transparent'"
         [style.background]="section.style.backgroundGradient || section.style.backgroundColor || 'transparent'"
         [style.color]="section.style.textColor || 'inherit'">
      
      <div class="container" [style.max-width]="section.style.maxWidth || '1200px'">
        <div class="cms-test-header" [style.text-align]="section.style.textAlign || 'center'">
          <h2 class="test-title"
              [style.color]="section.style.textColor || 'var(--secondary-color, #241814)'"
              [style.font-size]="section.style.titleFontSize || '36px'"
              [innerHTML]="section.title">
          </h2>
          <p *ngIf="section.subtitle" class="test-subtitle"
             [style.color]="section.style.textColor ? (section.style.textColor === '#ffffff' ? 'rgba(255,255,255,0.85)' : section.style.textColor) : 'var(--text-light, #716661)'"
             [style.font-size]="section.style.contentFontSize || '16px'">
            {{ section.subtitle }}
          </p>
        </div>

        <div class="test-grid" [style.grid-template-columns]="'repeat(' + (section.style.gridColumns || 3) + ', 1fr)'">
          <div *ngFor="let item of section.items" class="test-card" [style.border-radius]="section.style.borderRadius || '16px'">
            <div class="test-stars">
              <span *ngFor="let star of [1,2,3,4,5]">★</span>
            </div>
            <p class="test-quote">"{{ item.description }}"</p>
            <div class="test-author-box">
              <div class="test-avatar" [style.background]="'var(--primary-gradient)'">
                {{ (item.title || item.author || 'U')[0] }}
              </div>
              <div class="test-author-info">
                <strong>{{ item.title || item.author }}</strong>
                <span *ngIf="item.role">{{ item.role }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .cms-testimonials-wrapper { width: 100%; }
    .cms-test-header { margin-bottom: 2.5rem; }
    .test-title {
      font-weight: 800;
      color: var(--secondary-color, #241814);
      margin-bottom: 0.5rem;
    }
    :host ::ng-deep .test-title span {
      color: var(--primary-color, #ea580c);
    }
    .test-subtitle {
      color: var(--text-light, #716661);
    }
    .test-grid {
      display: grid;
      gap: 1.5rem;
    }
    .test-card {
      background: var(--background-white, #ffffff);
      padding: 1.8rem;
      border: 1.5px solid var(--border-color, #ede2d8);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .test-stars {
      color: #f59e0b;
      font-size: 1.1rem;
      margin-bottom: 0.8rem;
      letter-spacing: 2px;
    }
    .test-quote {
      color: var(--text-dark, #241814);
      line-height: 1.6;
      font-style: italic;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }
    .test-author-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .test-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      color: white;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .test-author-info {
      display: flex;
      flex-direction: column;
    }
    .test-author-info strong {
      font-size: 0.95rem;
      color: var(--secondary-color, #241814);
    }
    .test-author-info span {
      font-size: 0.8rem;
      color: var(--text-light, #716661);
    }
    @media (max-width: 900px) {
      .test-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `]
})
export class CmsTestimonialsComponent {
  @Input() section!: CmsSection;
}

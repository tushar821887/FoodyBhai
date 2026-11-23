import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsSection } from '../../../models/cms.model';

@Component({
  selector: 'app-cms-cta',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cms-cta-wrapper"
         [style.padding-top]="section.style.paddingTop || '40px'"
         [style.padding-bottom]="section.style.paddingBottom || '40px'">
      
      <div class="container" [style.max-width]="section.style.maxWidth || '1100px'">
        <div class="cms-cta-card" 
             [style.background]="section.style.backgroundGradient || section.style.backgroundColor || 'var(--primary-gradient)'"
             [style.color]="section.style.textColor || '#ffffff'"
             [style.border-radius]="section.style.borderRadius || '24px'"
             [style.text-align]="section.style.textAlign || 'center'">
          
          <span *ngIf="section.badge" class="cta-badge-pill">{{ section.badge }}</span>
          
          <h2 class="cta-title" [style.font-size]="section.style.titleFontSize || '32px'" [innerHTML]="section.title">
          </h2>
          
          <p *ngIf="section.subtitle" class="cta-subtitle" [style.font-size]="section.style.contentFontSize || '16px'">
            {{ section.subtitle }}
          </p>
          
          <div *ngIf="section.buttonText" class="cta-actions">
            <a [routerLink]="section.buttonLink || '/menu'" class="btn btn-white-pill">
              {{ section.buttonText }}
            </a>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .cms-cta-wrapper { width: 100%; }
    .cms-cta-card {
      padding: 3rem 2rem;
      box-shadow: 0 10px 30px var(--primary-glow, rgba(249, 95, 0, 0.25));
      position: relative;
      overflow: hidden;
    }
    .cta-badge-pill {
      display: inline-block;
      padding: 4px 14px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.8px;
      margin-bottom: 1rem;
      text-transform: uppercase;
    }
    .cta-title {
      font-weight: 800;
      margin-bottom: 0.75rem;
      line-height: 1.2;
    }
    :host ::ng-deep .cta-title span {
      color: #ffe082;
      text-decoration: underline;
    }
    .cta-subtitle {
      max-width: 600px;
      margin: 0 auto 1.75rem auto;
      opacity: 0.95;
      line-height: 1.5;
    }
    .btn-white-pill {
      background: #ffffff;
      color: var(--secondary-color, #241814);
      padding: 0.85rem 2.2rem;
      border-radius: 50px;
      font-weight: 800;
      font-size: 1rem;
      text-decoration: none;
      display: inline-block;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;
    }
    .btn-white-pill:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }
  `]
})
export class CmsCtaComponent {
  @Input() section!: CmsSection;
}

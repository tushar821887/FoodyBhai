import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsSection } from '../../../models/cms.model';
import { TiffinService } from '../../../services/tiffin.service';

@Component({
  selector: 'app-cms-tiffin-trust',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="cms-trust-section"
             [class.is-light-text]="section.style?.textColor === '#ffffff'"
             [style.padding-top]="section.style?.paddingTop || '60px'"
             [style.padding-bottom]="section.style?.paddingBottom || '60px'"
             [style.background-color]="section.style?.backgroundColor || '#ffffff'"
             [style.background]="section.style?.backgroundGradient || section.style?.backgroundColor || '#ffffff'"
             [style.color]="section.style?.textColor || 'inherit'">
      <div class="container" [style.max-width]="section.style?.maxWidth || '1200px'">

        <div class="section-header text-center animate-fade-in" *ngIf="section.title || section.subtitle">
          <div *ngIf="section.badge" class="section-tag">{{ section.badge }}</div>
          <h2 class="section-title"
              [style.color]="section.style?.textColor || '#1e293b'"
              [style.font-size]="section.style?.titleFontSize || '36px'"
              [innerHTML]="section.title || 'Our Kitchen & Hygiene Standards'">
          </h2>
          <p class="section-desc"
             [style.color]="section.style?.textColor ? (section.style?.textColor === '#ffffff' ? 'rgba(255,255,255,0.85)' : section.style?.textColor) : '#64748b'"
             [innerHTML]="section.subtitle || 'Every meal is prepared in a certified clean kitchen with the utmost hygiene and love.'">
          </p>
        </div>

        <div class="trust-grid">
          <div *ngFor="let item of trustItems" class="trust-item">
            <div class="trust-icon-box">{{ item.icon }}</div>
            <h4 class="trust-title">{{ item.title }}</h4>
            <p class="trust-desc">{{ item.description }}</p>
          </div>
        </div>

      </div>
    </section>
  `,
  styles: [`
    .cms-trust-section {
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
      margin: 0 auto;
      line-height: 1.6;
      text-align: center;
    }
    .trust-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }
    @media (max-width: 992px) {
      .trust-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 560px) {
      .trust-grid {
        grid-template-columns: 1fr;
      }
    }
    .trust-item {
      background: #faf7f2;
      border: 1.5px solid #fed7aa;
      border-radius: 18px;
      padding: 1.75rem 1.25rem;
      text-align: center;
      transition: all 0.3s ease;
    }
    .trust-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(234, 88, 12, 0.1);
      background: white;
    }
    .trust-icon-box {
      font-size: 2.4rem;
      margin-bottom: 0.75rem;
    }
    .trust-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 0.4rem;
    }
    .trust-desc {
      font-size: 0.85rem;
      color: #64748b;
      line-height: 1.5;
      margin: 0;
    }
  `]
})
export class CmsTiffinTrustComponent implements OnInit {
  @Input() section!: CmsSection;

  trustItems = [
    { icon: '💧', title: '100% RO Water Cooking', description: 'Every single grain of rice, curry, and dal is cooked exclusively with multi-stage purified RO water.' },
    { icon: '🧈', title: 'Pure Desi Ghee Phulkas', description: 'Hand-stretched whole wheat rotis smeared with pure desi ghee for authentic homestyle nutrition.' },
    { icon: '🌿', title: 'Zero Preservatives & Low Oil', description: 'No artificial food colors, tasting powders, or reuse of cooking oils. Clean food you can eat daily.' },
    { icon: '🛵', title: 'Insulated Hot Delivery', description: 'Delivered in sanitized, microwave-safe multi-compartment containers that lock in heat and freshness.' }
  ];

  private tiffinService = inject(TiffinService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.tiffinService.getConfig().subscribe(cfg => {
      if (cfg?.hero?.usps?.length) {
        const iconMap: Record<number, string> = { 0: '💧', 1: '🧈', 2: '🌿', 3: '🛵' };
        this.trustItems = cfg.hero.usps.slice(0, 4).map((title: string, idx: number) => ({
          icon: iconMap[idx] || '✨',
          title: title,
          description: this.trustItems[idx]?.description || 'Guaranteed highest homestyle food quality and cleanliness.'
        }));
        this.cdr.detectChanges();
      }
    });
  }
}

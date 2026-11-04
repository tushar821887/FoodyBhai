import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsSection } from '../../../models/cms.model';
import { TiffinService } from '../../../services/tiffin.service';

@Component({
  selector: 'app-cms-tiffin-steps',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="cms-steps-section"
             [class.is-light-text]="section.style?.textColor === '#ffffff'"
             [style.padding-top]="section.style?.paddingTop || '70px'"
             [style.padding-bottom]="section.style?.paddingBottom || '70px'"
             [style.background-color]="section.style?.backgroundColor || '#faf7f2'"
             [style.background]="section.style?.backgroundGradient || section.style?.backgroundColor || '#faf7f2'"
             [style.color]="section.style?.textColor || 'inherit'">
      <div class="container" [style.max-width]="section.style?.maxWidth || '1200px'">

        <div class="section-header text-center animate-fade-in">
          <div *ngIf="section.badge || 'Hassle-Free Ordering'" class="section-tag">
            {{ section.badge || 'Hassle-Free Ordering' }}
          </div>

          <h2 class="section-title"
              [style.color]="section.style?.textColor || '#1e293b'"
              [style.font-size]="section.style?.titleFontSize || '36px'"
              [innerHTML]="section.title || 'How FoodyBhai Tiffin Service Works'">
          </h2>

          <p class="section-desc"
             [style.color]="section.style?.textColor ? (section.style?.textColor === '#ffffff' ? 'rgba(255,255,255,0.85)' : section.style?.textColor) : '#64748b'"
             [style.font-size]="section.style?.contentFontSize || '16px'"
             [innerHTML]="section.subtitle || 'Enjoy pure homestyle goodness in 4 effortless steps. No long lock-ins, pause or cancel anytime.'">
          </p>
        </div>

        <div class="steps-grid">
          <div *ngFor="let step of steps" class="step-card">
            <div class="step-badge">{{ step.stepNumber }}</div>
            <div class="step-icon-wrap">{{ step.icon }}</div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc">{{ step.desc }}</p>
          </div>
        </div>

        <div class="text-center" style="margin-top: 3rem;" *ngIf="section.buttonText || true">
          <a [routerLink]="section.buttonLink || '/tiffin'" class="btn-start-plan">
            {{ section.buttonText || 'Choose Your Thali Plan' }} →
          </a>
        </div>

      </div>
    </section>
  `,
  styles: [`
    .cms-steps-section {
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
      margin-bottom: 3rem;
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

    .steps-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }
    @media (max-width: 992px) {
      .steps-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 560px) {
      .steps-grid {
        grid-template-columns: 1fr;
      }
    }

    .step-card {
      position: relative;
      background: white;
      border-radius: 20px;
      padding: 2.2rem 1.5rem 1.8rem;
      border: 1.5px solid #f1f5f9;
      box-shadow: 0 8px 25px rgba(0,0,0,0.04);
      text-align: center;
      transition: all 0.3s ease;
    }
    .step-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 15px 35px rgba(234, 88, 12, 0.12);
      border-color: #fed7aa;
    }
    .step-badge {
      position: absolute;
      top: -16px;
      left: 50%;
      transform: translateX(-50%);
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #ea580c;
      color: white;
      font-weight: 800;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(234, 88, 12, 0.35);
    }
    .step-icon-wrap {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    .step-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 0.5rem;
    }
    .step-desc {
      font-size: 0.88rem;
      color: #64748b;
      line-height: 1.5;
      margin: 0;
    }
    .btn-start-plan {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #ea580c;
      color: white;
      font-weight: 700;
      font-size: 1rem;
      padding: 13px 30px;
      border-radius: 50px;
      text-decoration: none;
      box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3);
      transition: all 0.25s ease;
    }
    .btn-start-plan:hover {
      background: #c2410c;
      transform: translateY(-2px);
    }
  `]
})
export class CmsTiffinStepsComponent implements OnInit {
  @Input() section!: CmsSection;

  steps = [
    { stepNumber: 1, icon: '🍱', title: 'Choose Your Plan', desc: 'Select Rozana, Standard, or Deluxe Thali according to your appetite and budget.' },
    { stepNumber: 2, icon: '📅', title: 'Set Schedule', desc: 'Pick Lunch (12:30 PM), Dinner (7:30 PM), or both. Choose your delivery start date.' },
    { stepNumber: 3, icon: '🛵', title: 'Daily Hot Delivery', desc: 'Fresh home food cooked in pure desi ghee delivered in sanitized insulated dabbas.' },
    { stepNumber: 4, icon: '⏸️', title: 'Flexible Control', desc: 'Traveling out of station? Pause subscription anytime with a single click or WhatsApp.' }
  ];

  private tiffinService = inject(TiffinService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.tiffinService.getConfig().subscribe(cfg => {
      if (cfg?.howItWorks?.length) {
        const iconMap: Record<number, string> = { 1: '🍱', 2: '📅', 3: '🛵', 4: '⏸️' };
        this.steps = cfg.howItWorks.map((s: any, idx: number) => ({
          stepNumber: s.stepNumber || (idx + 1),
          icon: iconMap[s.stepNumber || (idx + 1)] || '🍛',
          title: s.title,
          desc: s.desc
        }));
        this.cdr.detectChanges();
      }
    });
  }
}

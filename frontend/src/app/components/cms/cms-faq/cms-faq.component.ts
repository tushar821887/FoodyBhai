import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsSection } from '../../../models/cms.model';

@Component({
  selector: 'app-cms-faq',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cms-faq-wrapper"
         [class.is-light-text]="section.style.textColor === '#ffffff'"
         [style.padding-top]="section.style.paddingTop || '60px'"
         [style.padding-bottom]="section.style.paddingBottom || '60px'"
         [style.background-color]="section.style.backgroundColor || 'transparent'"
         [style.background]="section.style.backgroundGradient || section.style.backgroundColor || 'transparent'"
         [style.color]="section.style.textColor || 'inherit'">
      
      <div class="container" [style.max-width]="section.style.maxWidth || '850px'">
        <div class="cms-faq-header" [style.text-align]="section.style.textAlign || 'center'">
          <h2 class="cms-faq-title"
              [style.color]="section.style.textColor || 'var(--secondary-color, #241814)'"
              [style.font-size]="section.style.titleFontSize || '36px'"
              [innerHTML]="section.title">
          </h2>
          <p *ngIf="section.subtitle" class="cms-faq-subtitle"
             [style.color]="section.style.textColor ? (section.style.textColor === '#ffffff' ? 'rgba(255,255,255,0.85)' : section.style.textColor) : 'var(--text-light, #716661)'"
             [style.font-size]="section.style.contentFontSize || '16px'">
            {{ section.subtitle }}
          </p>
        </div>

        <div class="cms-faq-accordion">
          <div *ngFor="let item of section.items; let i = index" class="faq-item" [class.open]="openIndex === i">
            <button type="button" class="faq-question" (click)="toggle(i)">
              <span>{{ item.title }}</span>
              <span class="faq-icon">{{ openIndex === i ? '−' : '+' }}</span>
            </button>
            <div class="faq-answer" *ngIf="openIndex === i">
              <p>{{ item.description }}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .cms-faq-wrapper { width: 100%; }
    .cms-faq-header { margin-bottom: 2rem; }
    .cms-faq-title {
      font-weight: 800;
      color: var(--secondary-color, #241814);
      margin-bottom: 0.5rem;
    }
    :host ::ng-deep .cms-faq-title span {
      color: var(--primary-color, #ea580c);
    }
    .cms-faq-subtitle {
      color: var(--text-light, #716661);
    }
    .cms-faq-accordion {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .faq-item {
      background: var(--background-white, #ffffff);
      border: 1.5px solid var(--border-color, #ede2d8);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    .faq-item.open {
      border-color: var(--primary-border, #fed7aa);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
    }
    .faq-question {
      width: 100%;
      background: transparent;
      border: none;
      padding: 1.1rem 1.4rem;
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--secondary-color, #241814);
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      text-align: left;
    }
    .faq-icon {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--primary-color, #ea580c);
      margin-left: 1rem;
    }
    .faq-answer {
      padding: 0 1.4rem 1.25rem 1.4rem;
      color: var(--text-light, #716661);
      line-height: 1.6;
      font-size: 0.95rem;
    }
  `]
})
export class CmsFaqComponent {
  @Input() section!: CmsSection;
  openIndex = 0;

  toggle(i: number) {
    this.openIndex = this.openIndex === i ? -1 : i;
  }
}

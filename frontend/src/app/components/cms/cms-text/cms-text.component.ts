import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsSection } from '../../../models/cms.model';

@Component({
  selector: 'app-cms-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cms-text-wrapper"
         [style.padding-top]="section.style.paddingTop || '50px'"
         [style.padding-bottom]="section.style.paddingBottom || '50px'"
         [style.background-color]="section.style.backgroundColor || 'transparent'"
         [style.color]="section.style.textColor || 'inherit'">
      
      <div class="container" [style.max-width]="section.style.maxWidth || '900px'" [style.text-align]="section.style.textAlign || 'left'">
        <h2 *ngIf="section.title" class="cms-text-title" [style.font-size]="section.style.titleFontSize || '32px'" [innerHTML]="section.title">
        </h2>
        <div class="cms-text-content" [style.font-size]="section.style.contentFontSize || '16px'" [innerHTML]="section.content || section.subtitle"></div>
      </div>

    </div>
  `,
  styles: [`
    .cms-text-wrapper {
      width: 100%;
    }
    .cms-text-title {
      font-weight: 800;
      color: var(--secondary-color, #241814);
      margin-bottom: 1.5rem;
    }
    :host ::ng-deep .cms-text-title span {
      color: var(--primary-color, #ea580c);
    }
    .cms-text-content {
      line-height: 1.8;
      color: var(--text-dark, #241814);
    }
    .cms-text-content p {
      margin-bottom: 1rem;
    }
  `]
})
export class CmsTextComponent {
  @Input() section!: CmsSection;
}

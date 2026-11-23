import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CmsSection } from '../../../models/cms.model';

@Component({
  selector: 'app-cms-html',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cms-html-wrapper"
         [style.padding-top]="section.style.paddingTop || '40px'"
         [style.padding-bottom]="section.style.paddingBottom || '40px'"
         [style.background-color]="section.style.backgroundColor || 'transparent'">
      
      <div class="container" [style.max-width]="section.style.maxWidth || '1200px'">
        <h2 *ngIf="section.title" class="cms-html-title" [style.font-size]="section.style.titleFontSize || '32px'" [style.text-align]="section.style.textAlign || 'left'" [innerHTML]="section.title">
        </h2>
        <div class="raw-html-outlet" [innerHTML]="trustedHtml"></div>
      </div>

    </div>
  `,
  styles: [`
    .cms-html-wrapper { width: 100%; }
    .cms-html-title {
      font-weight: 800;
      color: var(--secondary-color, #241814);
      margin-bottom: 1.5rem;
    }
    :host ::ng-deep .cms-html-title span {
      color: var(--primary-color, #ea580c);
    }
    .raw-html-outlet {
      overflow-x: auto;
    }
  `]
})
export class CmsHtmlComponent {
  @Input() section!: CmsSection;

  constructor(private sanitizer: DomSanitizer) {}

  get trustedHtml(): SafeHtml {
    const raw = this.section.rawHtml || this.section.content || '';
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  }
}

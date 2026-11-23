import { Component, Input, Type, OnChanges, SimpleChanges, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { CmsSection } from '../../../models/cms.model';
import { CmsHeroComponent } from '../cms-hero/cms-hero.component';
import { CmsFeaturesComponent } from '../cms-features/cms-features.component';
import { CmsTextComponent } from '../cms-text/cms-text.component';
import { CmsBannerComponent } from '../cms-banner/cms-banner.component';
import { CmsCtaComponent } from '../cms-cta/cms-cta.component';
import { CmsFaqComponent } from '../cms-faq/cms-faq.component';
import { CmsTestimonialsComponent } from '../cms-testimonials/cms-testimonials.component';
import { CmsHtmlComponent } from '../cms-html/cms-html.component';
import { CmsAboutComponent } from '../cms-about/cms-about.component';
import { CmsCategoriesComponent } from '../cms-categories/cms-categories.component';
import { CmsPopularMenuComponent } from '../cms-popular-menu/cms-popular-menu.component';
import { CmsThalisComponent } from '../cms-thalis/cms-thalis.component';
import { CmsWeeklyMenuComponent } from '../cms-weekly-menu/cms-weekly-menu.component';
import { CmsTiffinStepsComponent } from '../cms-tiffin-steps/cms-tiffin-steps.component';
import { CmsTiffinTrustComponent } from '../cms-tiffin-trust/cms-tiffin-trust.component';
import { CmsTiffinFaqComponent } from '../cms-tiffin-faq/cms-tiffin-faq.component';
import { CmsTiffinAddonsComponent } from '../cms-tiffin-addons/cms-tiffin-addons.component';

@Component({
  selector: 'app-dynamic-section-renderer',
  standalone: true,
  imports: [CommonModule, NgComponentOutlet],
  template: `
    <ng-container *ngIf="section && section.isEnabled !== false">
      <ng-container 
        *ngComponentOutlet="getComponent(section.type); inputs: dynamicInputs">
      </ng-container>
    </ng-container>
  `
})
export class DynamicSectionRendererComponent implements OnChanges {
  @Input() section!: CmsSection;

  private cdr = inject(ChangeDetectorRef);

  get dynamicInputs(): Record<string, any> {
    return { section: this.section };
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.cdr.markForCheck();
  }

  private componentMap: Record<string, Type<any>> = {
    hero: CmsHeroComponent,
    about: CmsAboutComponent,
    about_story: CmsAboutComponent,
    story: CmsAboutComponent,
    categories: CmsCategoriesComponent,
    category: CmsCategoriesComponent,
    popular_menu: CmsPopularMenuComponent,
    menu: CmsPopularMenuComponent,
    thalis: CmsThalisComponent,
    thali: CmsThalisComponent,
    tiffin_plans: CmsThalisComponent,
    tiffin: CmsThalisComponent,
    weekly_menu: CmsWeeklyMenuComponent,
    tiffin_weekly: CmsWeeklyMenuComponent,
    weekly: CmsWeeklyMenuComponent,
    tiffin_steps: CmsTiffinStepsComponent,
    how_it_works: CmsTiffinStepsComponent,
    steps: CmsTiffinStepsComponent,
    tiffin_trust: CmsTiffinTrustComponent,
    hygiene_standards: CmsTiffinTrustComponent,
    trust: CmsTiffinTrustComponent,
    tiffin_faq: CmsTiffinFaqComponent,
    tiffin_addons: CmsTiffinAddonsComponent,
    addons: CmsTiffinAddonsComponent,
    features: CmsFeaturesComponent,
    rich_text: CmsTextComponent,
    image_text: CmsBannerComponent,
    banner: CmsBannerComponent,
    promo_cta: CmsCtaComponent,
    cta: CmsCtaComponent,
    faq: CmsFaqComponent,
    testimonials: CmsTestimonialsComponent,
    custom_html: CmsHtmlComponent
  };

  getComponent(type: string): Type<any> {
    if (!type) return CmsTextComponent;
    const key = type.toString().toLowerCase().trim();
    return this.componentMap[key] || this.componentMap[type] || CmsTextComponent;
  }
}

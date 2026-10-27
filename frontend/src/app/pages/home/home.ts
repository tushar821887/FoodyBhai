import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsService } from '../../services/cms.service';
import { CmsPage, CmsSection } from '../../models/cms.model';
import { DynamicSectionRendererComponent } from '../../components/cms/dynamic-section-renderer/dynamic-section-renderer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DynamicSectionRendererComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  homePage: CmsPage | null = null;
  isLoading = true;

  private cmsService = inject(CmsService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.cmsService.getPageBySlug('').subscribe(page => {
      if (page && page.sections && page.sections.length > 0) {
        this.homePage = JSON.parse(JSON.stringify(page));
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    // Proactively pull latest database CMS pages on navigation
    this.cmsService.fetchLivePages(true).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  trackBySection(index: number, sec: CmsSection): string {
    return `${sec.id}_${sec.title || ''}_${sec.subtitle || ''}_${sec.badge || ''}_${sec.buttonText || ''}_${sec.buttonLink || ''}_${sec.imageUrl || ''}_${sec.rawHtml || ''}_${sec.content || ''}_${sec.isEnabled !== false}_${sec.style?.backgroundColor || ''}_${sec.style?.backgroundGradient || ''}_${sec.style?.titleFontSize || ''}_${sec.style?.borderRadius || ''}_${sec.items?.length || 0}`;
  }
}

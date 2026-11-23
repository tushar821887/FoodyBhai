import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { CmsService } from '../../services/cms.service';
import { CmsPage, CmsSection } from '../../models/cms.model';
import { DynamicSectionRendererComponent } from '../../components/cms/dynamic-section-renderer/dynamic-section-renderer.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, DynamicSectionRendererComponent],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFound implements OnInit {
  matchedPage: CmsPage | null = null;
  isLoading = true;

  private title = inject(Title);
  private meta = inject(Meta);
  private cmsService = inject(CmsService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    const rawPath = this.router.url.split('?')[0].replace(/^\//, '');
    
    this.cmsService.getPageBySlug(rawPath).subscribe(page => {
      this.isLoading = false;
      if (page) {
        this.matchedPage = JSON.parse(JSON.stringify(page));
        this.title.setTitle(`${page.title} | FoodyBhai Meerut`);
        if (page.metaDescription) {
          this.meta.updateTag({ name: 'description', content: page.metaDescription });
        }
        this.cdr.detectChanges();
      } else {
        this.matchedPage = null;
        this.title.setTitle('Page Not Found | FoodyBhai');
        this.cdr.detectChanges();
      }
    });

    this.cmsService.fetchLivePages(true).subscribe();
  }

  trackBySection(index: number, sec: CmsSection): string {
    return `${sec.id}_${sec.title || ''}_${sec.subtitle || ''}_${sec.badge || ''}_${sec.buttonText || ''}_${sec.buttonLink || ''}_${sec.imageUrl || ''}_${sec.rawHtml || ''}_${sec.content || ''}_${sec.isEnabled !== false}_${sec.style?.backgroundColor || ''}_${sec.style?.backgroundGradient || ''}_${sec.style?.titleFontSize || ''}_${sec.style?.borderRadius || ''}_${sec.items?.length || 0}`;
  }
}

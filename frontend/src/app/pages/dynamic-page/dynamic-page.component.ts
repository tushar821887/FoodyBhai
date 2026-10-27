import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { CmsService } from '../../services/cms.service';
import { CmsPage } from '../../models/cms.model';
import { DynamicSectionRendererComponent } from '../../components/cms/dynamic-section-renderer/dynamic-section-renderer.component';

@Component({
  selector: 'app-dynamic-page',
  standalone: true,
  imports: [CommonModule, RouterModule, DynamicSectionRendererComponent],
  template: `
    <!-- Loading state -->
    <div *ngIf="isLoading" class="global-loading-container">
      <i class="fa-solid fa-spinner fa-spin global-loading-spinner"></i>
      <p style="color: var(--text-light); font-weight: 500;">Loading page...</p>
    </div>

    <div class="cms-dynamic-page" *ngIf="!isLoading && page">
      <div *ngFor="let section of page.sections; trackBy: trackBySectionId">
        <app-dynamic-section-renderer [section]="section"></app-dynamic-section-renderer>
      </div>
    </div>

    <!-- Fallback / Page Not Found -->
    <div *ngIf="!isLoading && !page" class="page-not-found-container text-center section">
      <div class="container animate-fade-in">
        <div class="empty-icon-wrap">ðŸ”</div>
        <h2>Page Under Construction</h2>
        <p>This page hasn't been published yet or is currently being updated in our CMS Studio.</p>
        <a routerLink="/" class="btn btn-primary mt-3">Return to Home</a>
      </div>
    </div>
  `,
  styles: [`
    .cms-dynamic-page {
      min-height: 60vh;
      width: 100%;
    }
    .page-not-found-container {
      padding: 6rem 1rem;
    }
    .empty-icon-wrap {
      font-size: 4rem;
      margin-bottom: 1.5rem;
    }
    .page-not-found-container h2 {
      font-weight: 800;
      color: var(--secondary-color, #241814);
      margin-bottom: 0.5rem;
    }
    .page-not-found-container p {
      color: var(--text-light, #716661);
      max-width: 500px;
      margin: 0 auto 2rem auto;
    }
  `]
})
export class DynamicPageComponent implements OnInit {
  page: CmsPage | null = null;
  isLoading = true;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cmsService = inject(CmsService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') || this.route.snapshot.url.map(u => u.path).join('/') || '';
      this.loadPage(slug);
    });
  }

  loadPage(slug: string) {
    this.isLoading = true;
    this.cmsService.getPageBySlug(slug).subscribe(p => {
      this.page = p;
      this.isLoading = false;

      if (p) {
        this.titleService.setTitle(`${p.title} | FoodyBhai Meerut`);
        if (p.metaDescription) {
          this.metaService.updateTag({ name: 'description', content: p.metaDescription });
        }
      }
    });
  }

  trackBySectionId(index: number, section: any): string {
    return section.id || index.toString();
  }
}

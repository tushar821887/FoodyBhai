import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CmsService } from '../../services/cms.service';
import { CmsPage, CmsSection, SectionType, CmsSectionItem } from '../../models/cms.model';

@Component({
  selector: 'app-page-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './page-builder.component.html',
  styleUrl: './page-builder.component.css'
})
export class PageBuilderComponent implements OnInit {
  pages: CmsPage[] = [];
  selectedPage: CmsPage | null = null;
  selectedSection: CmsSection | null = null;
  
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  // Device Preview Mode
  previewMode: 'desktop' | 'mobile' = 'desktop';

  // New Route Modal
  showNewRouteModal = false;
  newRouteSlug = '';
  newRouteTitle = '';
  newRouteMeta = '';

  // Add Section Modal
  showAddSectionModal = false;

  private cmsService = inject(CmsService);

  ngOnInit() {
    this.cmsService.pages$.subscribe(pages => {
      if (pages && pages.length > 0) {
        this.pages = JSON.parse(JSON.stringify(pages));
        if (!this.selectedPage) {
          this.selectPage(this.pages[0]);
        }
      }
    });
  }

  selectPage(page: CmsPage) {
    this.selectedPage = page;
    if (page.sections && page.sections.length > 0) {
      this.selectedSection = page.sections[0];
    } else {
      this.selectedSection = null;
    }
  }

  selectSection(sec: CmsSection) {
    this.selectedSection = sec;
  }

  openNewRouteModal() {
    this.newRouteSlug = '';
    this.newRouteTitle = '';
    this.newRouteMeta = '';
    this.showNewRouteModal = true;
  }

  createRoute() {
    if (!this.newRouteTitle.trim()) {
      alert('Please enter a Page Title.');
      return;
    }
    const cleanSlug = this.newRouteSlug.trim().toLowerCase().replace(/^\//, '').replace(/\s+/g, '-');
    if (!cleanSlug) {
      alert('Please enter a valid route path slug (e.g. offers, catering, deals).');
      return;
    }

    // Check duplicate
    if (this.pages.some(p => p.slug === cleanSlug)) {
      alert(`Route /${cleanSlug} already exists.`);
      return;
    }

    const newPage: CmsPage = {
      id: 'page-' + Date.now(),
      slug: cleanSlug,
      title: this.newRouteTitle,
      metaDescription: this.newRouteMeta,
      isCustomRoute: true,
      isEnabled: true,
      sections: [
        {
          id: 'sec-' + Date.now(),
          type: 'hero',
          title: this.newRouteTitle,
          subtitle: 'Welcome to our ' + this.newRouteTitle + ' page.',
          badge: '✨ NEW SECTION',
          buttonText: 'Order Menu',
          buttonLink: '/menu',
          style: {
            paddingTop: '60px',
            paddingBottom: '60px',
            maxWidth: '1200px',
            textAlign: 'center',
            titleFontSize: '42px',
            contentFontSize: '18px'
          },
          isEnabled: true
        }
      ]
    };

    this.pages.push(newPage);
    this.selectPage(newPage);
    this.showNewRouteModal = false;
    this.publishAll('Route /' + cleanSlug + ' created successfully!');
  }

  deletePage(page: CmsPage) {
    if (page.slug === '') {
      alert('The Home page route cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to delete route "/${page.slug}"? This cannot be undone.`)) {
      return;
    }
    this.pages = this.pages.filter(p => p.id !== page.id);
    if (this.pages.length > 0) {
      this.selectPage(this.pages[0]);
    } else {
      this.selectedPage = null;
      this.selectedSection = null;
    }
    this.publishAll('Route deleted successfully.');
  }

  openAddSectionModal() {
    this.showAddSectionModal = true;
  }

  addSection(type: SectionType) {
    if (!this.selectedPage) return;

    const newSec: CmsSection = {
      id: 'sec-' + Date.now(),
      type: type,
      title: this.getDefaultTitleForType(type),
      subtitle: this.getDefaultSubtitleForType(type),
      badge: type === 'hero' || type === 'promo_cta' ? 'HOT DEAL' : undefined,
      buttonText: type === 'hero' || type === 'promo_cta' || type === 'image_text' ? 'Explore Menu' : undefined,
      buttonLink: '/menu',
      imageUrl: type === 'hero' || type === 'image_text' ? 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80' : undefined,
      imagePosition: 'right',
      items: this.getDefaultItemsForType(type),
      content: type === 'rich_text' ? '<p>Write your detailed story, policies, or announcement here.</p>' : undefined,
      rawHtml: type === 'custom_html' ? '<div style="padding: 20px; background: #fff; border-radius: 12px; text-align: center;"><h3>Custom HTML Block</h3><p>Paste any embed code here.</p></div>' : undefined,
      style: {
        paddingTop: '60px',
        paddingBottom: '60px',
        maxWidth: '1200px',
        textAlign: type === 'hero' ? 'left' : 'center',
        titleFontSize: '36px',
        contentFontSize: '16px',
        gridColumns: type === 'features' ? 3 : type === 'testimonials' ? 3 : 2,
        gridGap: '24px',
        borderRadius: '16px'
      },
      isEnabled: true
    };

    if (!this.selectedPage.sections) this.selectedPage.sections = [];
    this.selectedPage.sections.push(newSec);
    this.selectedSection = newSec;
    this.showAddSectionModal = false;
  }

  moveSectionUp(index: number) {
    if (!this.selectedPage || index <= 0) return;
    const sections = this.selectedPage.sections;
    const temp = sections[index];
    sections[index] = sections[index - 1];
    sections[index - 1] = temp;
  }

  moveSectionDown(index: number) {
    if (!this.selectedPage || index >= this.selectedPage.sections.length - 1) return;
    const sections = this.selectedPage.sections;
    const temp = sections[index];
    sections[index] = sections[index + 1];
    sections[index + 1] = temp;
  }

  removeSection(index: number) {
    if (!this.selectedPage) return;
    if (!confirm('Are you sure you want to delete this section?')) return;
    this.selectedPage.sections.splice(index, 1);
    if (this.selectedPage.sections.length > 0) {
      this.selectedSection = this.selectedPage.sections[0];
    } else {
      this.selectedSection = null;
    }
  }

  // Card items management for Features / FAQ / Testimonials
  addItemToSection() {
    if (!this.selectedSection) return;
    if (!this.selectedSection.items) this.selectedSection.items = [];
    
    this.selectedSection.items.push({
      id: 'item-' + Date.now(),
      icon: '✨',
      title: 'New Feature / Question',
      description: 'Add description, benefits, or answers for your customers here.',
      role: 'Verified Customer'
    });
  }

  removeItemFromSection(index: number) {
    if (!this.selectedSection || !this.selectedSection.items) return;
    this.selectedSection.items.splice(index, 1);
  }

  publishAll(customMsg?: string) {
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.cmsService.saveAllPages(this.pages).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = customMsg || '🎉 Website pages & sections successfully published live to website!';
        setTimeout(() => this.successMessage = '', 6000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = 'Failed to publish pages. Please ensure admin session is active.';
        console.error(err);
      }
    });
  }

  private getDefaultTitleForType(type: SectionType): string {
    switch(type) {
      case 'hero': return 'Delivering Meerut’s Most Flavorful Food';
      case 'features': return 'Why Choose Foody Bhai';
      case 'rich_text': return 'Our Story & Culinary Standards';
      case 'image_text': return 'Fresh Ingredients, Handcrafted Recipes';
      case 'promo_cta': return 'Get Flat 20% OFF Your Order!';
      case 'testimonials': return 'What Food Lovers Say About Us';
      case 'faq': return 'Frequently Asked Questions';
      case 'custom_html': return 'Custom Interactive Section';
      default: return 'New Section';
    }
  }

  private getDefaultSubtitleForType(type: SectionType): string {
    switch(type) {
      case 'hero': return 'Authentic Indian curries, aromatic biryanis, and homestyle delights delivered to your home.';
      case 'features': return 'Four cornerstones that set our kitchen apart from the rest.';
      case 'rich_text': return 'Learn how our chefs select local ingredients and slow-cook traditional gravies.';
      case 'image_text': return 'From sizzling appetizers to royal family thalis, every dish is prepared with hygiene and love.';
      case 'promo_cta': return 'Use code FOODY20 at checkout for instant savings.';
      case 'testimonials': return 'Real reviews from hungry customers across Meerut.';
      case 'faq': return 'Everything you need to know about deliveries, orders, and catering.';
      default: return '';
    }
  }

  private getDefaultItemsForType(type: SectionType): CmsSectionItem[] | undefined {
    if (type === 'features') {
      return [
        { id: '1', icon: '🌿', title: '100% Fresh', description: 'Fresh farm ingredients and authentic spices everyday.' },
        { id: '2', icon: '⚡', title: '30-Min Delivery', description: 'Hot and fresh directly from pan to your dining table.' },
        { id: '3', icon: '🛡️', title: 'Hygienic Kitchen', description: 'Triple sealed packaging and clean cooking practices.' }
      ];
    }
    if (type === 'faq') {
      return [
        { id: '1', title: 'What is the delivery area in Meerut?', description: 'We deliver throughout Meerut city including Mohanpuri, Abu Lane, Cantt, Shastri Nagar, and Modipuram.' },
        { id: '2', title: 'How can I pay for my order?', description: 'We accept Online UPI, Credit/Debit cards, Net Banking, and Cash on Delivery.' }
      ];
    }
    if (type === 'testimonials') {
      return [
        { id: '1', title: 'Rohit Sharma', role: 'Meerut Cantt', description: 'Best Dal Makhani and Paneer Tikka in Meerut! Food was piping hot and packing was 10/10.' },
        { id: '2', title: 'Pooja Verma', role: 'Shastri Nagar', description: 'The family thali is tremendous value for money. Pure ghar jaisa swad!' }
      ];
    }
    return undefined;
  }
}

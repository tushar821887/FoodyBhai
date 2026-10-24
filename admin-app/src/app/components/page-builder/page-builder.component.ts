import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CmsService } from '../../services/cms.service';
import { CmsPage, CmsSection, SectionType, CmsSectionItem } from '../../models/cms.model';
import { RichEditorComponent } from '../rich-editor/rich-editor.component';

@Component({
  selector: 'app-page-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RichEditorComponent],
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
  previewMode: 'desktop' | 'mobile' = 'mobile';
  showCanvas = true;
  toggleCanvasVisibility() {
    this.showCanvas = !this.showCanvas;
  }

  // Section search filter
  sectionSearch = '';

  // Mobile Tab Navigation ('sections' | 'inspector' | 'preview')
  mobileTab: 'sections' | 'inspector' | 'preview' = 'sections';

  setMobileTab(tab: 'sections' | 'inspector' | 'preview') {
    this.mobileTab = tab;
  }

  // New Route Modal
  showNewRouteModal = false;
  newRouteSlug = '';
  newRouteTitle = '';
  newRouteMeta = '';

  // Add Section Modal
  showAddSectionModal = false;

  private cmsService = inject(CmsService);

  get filteredSections(): CmsSection[] {
    if (!this.selectedPage || !this.selectedPage.sections) return [];
    if (!this.sectionSearch.trim()) return this.selectedPage.sections;
    const q = this.sectionSearch.toLowerCase().trim();
    return this.selectedPage.sections.filter(sec => 
      sec.type.toLowerCase().includes(q) || 
      (sec.title && sec.title.toLowerCase().includes(q)) ||
      (sec.badge && sec.badge.toLowerCase().includes(q))
    );
  }

  cleanTitle(title?: string): string {
    if (!title) return '';
    return title.replace(/<[^>]*>/g, '').trim();
  }

  duplicateSection(sec: CmsSection, event?: Event) {
    if (event) event.stopPropagation();
    if (!this.selectedPage) return;
    const index = this.selectedPage.sections.findIndex(s => s.id === sec.id);
    if (index === -1) return;
    const cloned: CmsSection = JSON.parse(JSON.stringify(sec));
    cloned.id = 'sec-' + Date.now();
    cloned.title = (cloned.title || '') + ' (Copy)';
    this.selectedPage.sections.splice(index + 1, 0, cloned);
    this.selectedSection = cloned;
    if (typeof window !== 'undefined' && window.innerWidth <= 992) {
      this.mobileTab = 'inspector';
    }
  }

  highlightSelectedWord(inputEl?: HTMLInputElement) {
    if (!this.selectedSection) return;
    let text = this.selectedSection.title || '';
    if (inputEl && inputEl.selectionStart !== null && inputEl.selectionEnd !== null && inputEl.selectionStart !== inputEl.selectionEnd) {
      const start = inputEl.selectionStart;
      const end = inputEl.selectionEnd;
      const selected = text.substring(start, end);
      if (selected.startsWith('<span>') && selected.endsWith('</span>')) {
        const unwrapped = selected.replace(/^<span>/, '').replace(/<\/span>$/, '');
        this.selectedSection.title = text.substring(0, start) + unwrapped + text.substring(end);
      } else {
        this.selectedSection.title = text.substring(0, start) + '<span>' + selected + '</span>' + text.substring(end);
      }
    } else {
      const words = text.trim().split(/\s+/);
      if (words.length > 0) {
        const lastIdx = words.length - 1;
        if (!words[lastIdx].includes('<span>')) {
          words[lastIdx] = `<span>${words[lastIdx]}</span>`;
          this.selectedSection.title = words.join(' ');
        }
      }
    }
  }

  stripTitleTags() {
    if (!this.selectedSection || !this.selectedSection.title) return;
    this.selectedSection.title = this.cleanTitle(this.selectedSection.title);
  }

  setBgColor(color: string) {
    if (!this.selectedSection) return;
    if (!this.selectedSection.style) this.selectedSection.style = {};
    this.selectedSection.style.backgroundColor = color;
    this.selectedSection.style.backgroundGradient = ''; // Always clear gradient when solid color is chosen
  }

  setTextColor(color: string) {
    if (!this.selectedSection) return;
    if (!this.selectedSection.style) this.selectedSection.style = {};
    this.selectedSection.style.textColor = color;
  }

  setGradient(gradient: string) {
    if (!this.selectedSection) return;
    if (!this.selectedSection.style) this.selectedSection.style = {};
    this.selectedSection.style.backgroundGradient = gradient;
  }

  ngOnInit() {
    this.cmsService.pages$.subscribe(pages => {
      if (pages && pages.length > 0) {
        if (this.isSaving) return;

        const currentSlug = this.selectedPage ? this.selectedPage.slug : undefined;
        const currentSecId = this.selectedSection ? this.selectedSection.id : undefined;

        this.pages = JSON.parse(JSON.stringify(pages));

        if (currentSlug !== undefined) {
          this.selectedPage = this.pages.find(p => p.slug === currentSlug) || this.pages[0];
        } else {
          this.selectedPage = this.pages[0];
        }

        if (this.selectedPage && this.selectedPage.sections) {
          if (currentSecId) {
            this.selectedSection = this.selectedPage.sections.find(s => s.id === currentSecId) || this.selectedPage.sections[0] || null;
          } else {
            this.selectedSection = this.selectedPage.sections[0] || null;
          }
        } else {
          this.selectedSection = null;
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
    if (typeof window !== 'undefined' && window.innerWidth <= 992) {
      this.mobileTab = 'inspector';
    }
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
      badge: type === 'hero' || type === 'promo_cta' ? 'HOT DEAL' : (type === 'about_story' ? 'OUR STORY' : undefined),
      buttonText: type === 'hero' || type === 'promo_cta' || type === 'image_text' || type === 'banner' ? 'Explore Menu' : (type === 'categories' || type === 'popular_menu' ? 'Browse Full Menu' : undefined),
      buttonLink: '/menu',
      imageUrl: type === 'hero' || type === 'image_text' || type === 'about_story' || type === 'banner' ? 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80' : undefined,
      imagePosition: type === 'about_story' ? 'left' : 'right',
      items: this.getDefaultItemsForType(type),
      content: type === 'rich_text' 
        ? '<p>Write your detailed story, policies, or announcement here.</p>' 
        : (type === 'about_story' ? '<p>Welcome to FoodyBhai. Authentic North Indian culinary heritage crafted with pure desi ghee and fresh spices.</p>' : undefined),
      rawHtml: type === 'custom_html' ? '<div style="padding: 20px; background: #fff; border-radius: 12px; text-align: center;"><h3>Custom HTML Block</h3><p>Paste any embed code here.</p></div>' : undefined,
      style: {
        paddingTop: '60px',
        paddingBottom: '60px',
        maxWidth: '1200px',
        textAlign: type === 'hero' || type === 'about_story' ? 'left' : 'center',
        titleFontSize: '36px',
        contentFontSize: '16px',
        gridColumns: type === 'features' ? 4 : type === 'testimonials' ? 3 : (type === 'categories' || type === 'popular_menu' ? 4 : 2),
        gridGap: '24px',
        borderRadius: '16px'
      },
      isEnabled: true
    };

    if (!this.selectedPage.sections) this.selectedPage.sections = [];
    this.selectedPage.sections.push(newSec);
    this.selectedSection = newSec;
    this.showAddSectionModal = false;
    if (typeof window !== 'undefined' && window.innerWidth <= 992) {
      this.mobileTab = 'inspector';
    }
  }

  moveSectionUp(sec: CmsSection) {
    if (!this.selectedPage || !this.selectedPage.sections) return;
    const idx = this.selectedPage.sections.findIndex(s => s.id === sec.id);
    if (idx <= 0) return;
    const sections = this.selectedPage.sections;
    const temp = sections[idx];
    sections[idx] = sections[idx - 1];
    sections[idx - 1] = temp;
    this.publishAll('Section order updated.');
  }

  moveSectionDown(sec: CmsSection) {
    if (!this.selectedPage || !this.selectedPage.sections) return;
    const idx = this.selectedPage.sections.findIndex(s => s.id === sec.id);
    if (idx === -1 || idx >= this.selectedPage.sections.length - 1) return;
    const sections = this.selectedPage.sections;
    const temp = sections[idx];
    sections[idx] = sections[idx + 1];
    sections[idx + 1] = temp;
    this.publishAll('Section order updated.');
  }

  removeSection(sec: CmsSection) {
    if (!this.selectedPage || !this.selectedPage.sections) return;
    const title = this.cleanTitle(sec.title) || sec.type;
    if (!confirm(`Are you sure you want to delete the "${title}" section?`)) return;
    const idx = this.selectedPage.sections.findIndex(s => s.id === sec.id);
    if (idx !== -1) {
      this.selectedPage.sections.splice(idx, 1);
    }
    if (this.selectedSection?.id === sec.id) {
      this.selectedSection = this.selectedPage.sections[0] || null;
      if (!this.selectedSection && typeof window !== 'undefined' && window.innerWidth <= 992) {
        this.mobileTab = 'sections';
      }
    }
    this.publishAll(`Section "${title}" removed successfully.`);
  }

  // Card items management for Features / FAQ / Testimonials / Story
  addItemToSection() {
    if (!this.selectedSection) return;
    if (!this.selectedSection.items) this.selectedSection.items = [];
    
    this.selectedSection.items.push({
      id: 'item-' + Date.now(),
      icon: '✨',
      title: 'New Feature / Item',
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
        this.successMessage = customMsg || '🎉 Website pages & sections successfully published live to database!';
        setTimeout(() => this.successMessage = '', 6000);
      },
      error: (err) => {
        this.isSaving = false;
        const msg = err.error?.message || err.message || '';
        if (err.status === 401) {
          this.errorMessage = 'Admin session expired (401). Please logout and log back into admin to refresh credentials.';
        } else if (err.status === 404) {
          this.errorMessage = 'Backend endpoint not found (404). Please upload backend-build.zip to your server.';
        } else {
          this.errorMessage = 'Failed to publish: ' + (msg || 'Please ensure admin session is active.');
        }
        console.error('Publish error:', err);
      }
    });
  }

  private getDefaultTitleForType(type: SectionType): string {
    switch(type) {
      case 'hero': return 'Delivering Meerut’s Most Flavorful Food';
      case 'about_story': return 'Welcome to FoodyBhai';
      case 'categories': return 'Explore Categories';
      case 'popular_menu': return 'Popular Menu';
      case 'features': return 'Why Choose Foody Bhai';
      case 'rich_text': return 'Our Story & Culinary Standards';
      case 'image_text': return 'Fresh Ingredients, Handcrafted Recipes';
      case 'promo_cta': return 'Get Flat 20% OFF Your Order!';
      case 'testimonials': return 'What Food Lovers Say About Us';
      case 'faq': return 'Frequently Asked Questions';
      case 'banner': return 'Get the Foody Bhai Mobile App';
      case 'custom_html': return 'Custom Interactive Section';
      default: return 'New Section';
    }
  }

  private getDefaultSubtitleForType(type: SectionType): string {
    switch(type) {
      case 'hero': return 'Authentic Indian curries, aromatic biryanis, and homestyle delights delivered to your home.';
      case 'about_story': return 'Your ultimate destination for discovering authentic, easy-to-follow recipes and hot meals.';
      case 'categories': return 'Find exactly what you\'re craving by browsing our recipe categories.';
      case 'popular_menu': return 'Discover our most loved and highly-rated recipes from the community.';
      case 'features': return 'Four cornerstones that set our kitchen apart from the rest.';
      case 'rich_text': return 'Learn how our chefs select local ingredients and slow-cook traditional gravies.';
      case 'image_text': return 'From sizzling appetizers to royal family thalis, every dish is prepared with hygiene and love.';
      case 'promo_cta': return 'Use code FOODY20 at checkout for instant savings.';
      case 'testimonials': return 'Real reviews from hungry customers across Meerut.';
      case 'faq': return 'Everything you need to know about deliveries, orders, and catering.';
      case 'banner': return 'Enjoy lightning-fast ordering, live GPS tracking, and exclusive app discounts.';
      default: return '';
    }
  }

  private getDefaultItemsForType(type: SectionType): CmsSectionItem[] | undefined {
    if (type === 'about_story') {
      return [
        { id: '1', icon: 'fa-solid fa-list-check', title: 'Step-by-Step Instructions', description: 'Tested recipes guaranteeing rich taste and consistent perfection.' },
        { id: '2', icon: 'fa-solid fa-leaf', title: 'Authentic Ingredients', description: 'Farm-fresh vegetables, cold-pressed oils, and pure desi ghee.' },
        { id: '3', icon: 'fa-solid fa-clock', title: 'Quick & Punctual Delivery', description: 'Prepared under strict hygiene and delivered hot within 30 minutes.' }
      ];
    }
    if (type === 'features') {
      return [
        { id: '1', icon: '🌿', title: '100% Fresh', description: 'Fresh farm ingredients and authentic spices everyday.' },
        { id: '2', icon: '⚡', title: '30-Min Delivery', description: 'Hot and fresh directly from pan to your dining table.' },
        { id: '3', icon: '🍲', title: 'Ghar Jaisa Swad', description: 'Authentic slow-cooked gravies with traditional aromatics.' },
        { id: '4', icon: '🛡️', title: 'Hygienic Kitchen', description: 'Triple sealed packaging and clean cooking practices.' }
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

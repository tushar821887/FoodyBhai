import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsSection } from '../../../models/cms.model';

@Component({
  selector: 'app-cms-tiffin-faq',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="cms-tiffin-faq-section"
             [class.is-light-text]="section.style?.textColor === '#ffffff'"
             [style.padding-top]="section.style?.paddingTop || '70px'"
             [style.padding-bottom]="section.style?.paddingBottom || '70px'"
             [style.background-color]="section.style?.backgroundColor || '#faf7f2'"
             [style.background]="section.style?.backgroundGradient || section.style?.backgroundColor || '#faf7f2'"
             [style.color]="section.style?.textColor || 'inherit'">
      <div class="container" [style.max-width]="section.style?.maxWidth || '900px'">

        <div class="section-header text-center animate-fade-in">
          <div *ngIf="section.badge || 'Got Questions?'" class="section-tag">
            {{ section.badge || 'Got Questions?' }}
          </div>

          <h2 class="section-title"
              [style.color]="section.style?.textColor || '#1e293b'"
              [style.font-size]="section.style?.titleFontSize || '36px'"
              [innerHTML]="section.title || 'Tiffin Service Frequently Asked Questions'">
          </h2>

          <p class="section-desc"
             [style.color]="section.style?.textColor ? (section.style?.textColor === '#ffffff' ? 'rgba(255,255,255,0.85)' : section.style?.textColor) : '#64748b'"
             [innerHTML]="section.subtitle || 'Everything you need to know about deliveries, pausing meals, trial orders, and hygiene.'">
          </p>
        </div>

        <div class="faq-list">
          <div *ngFor="let faq of faqs; let i = index" class="faq-card" [class.open]="openIndex === i">
            <button type="button" class="faq-question-btn" (click)="toggleFaq(i)">
              <span class="faq-q-text">{{ faq.q }}</span>
              <span class="faq-toggle-icon">{{ openIndex === i ? '−' : '+' }}</span>
            </button>
            <div class="faq-answer-box" *ngIf="openIndex === i">
              <p [innerHTML]="faq.a"></p>
            </div>
          </div>
        </div>

        <!-- Help Banner -->
        <div class="tiffin-support-callout">
          <div class="callout-content">
            <h4>Have more questions or custom meal requirements?</h4>
            <p>Our kitchen team is available daily from 9:00 AM to 9:30 PM.</p>
          </div>
          <div class="callout-actions">
            <a href="tel:8218870579" class="btn-support-call">
              📞 Call: +91 8218870579
            </a>
            <a href="https://wa.me/918218870579?text=Hi%20FoodyBhai%2C%20I%20have%20a%20query%20about%20Tiffin%20Service" target="_blank" class="btn-support-wa">
              💬 WhatsApp Us
            </a>
          </div>
        </div>

      </div>
    </section>
  `,
  styles: [`
    .cms-tiffin-faq-section {
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
      margin-bottom: 2.5rem;
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
      margin: 0 auto 1.5rem;
      line-height: 1.6;
      text-align: center;
    }

    .faq-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .faq-card {
      background: white;
      border-radius: 14px;
      border: 1.5px solid #e2e8f0;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    .faq-card.open {
      border-color: #ea580c;
      box-shadow: 0 4px 15px rgba(234, 88, 12, 0.1);
    }
    .faq-question-btn {
      width: 100%;
      padding: 1.1rem 1.4rem;
      background: transparent;
      border: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-align: left;
      cursor: pointer;
      gap: 12px;
    }
    .faq-q-text {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
    }
    .faq-toggle-icon {
      font-size: 1.4rem;
      font-weight: 800;
      color: #ea580c;
      min-width: 20px;
      text-align: center;
    }
    .faq-answer-box {
      padding: 0 1.4rem 1.25rem;
      color: #475569;
      font-size: 0.95rem;
      line-height: 1.6;
      border-top: 1px dashed #f1f5f9;
      padding-top: 0.85rem;
    }

    .tiffin-support-callout {
      margin-top: 2.5rem;
      background: #1e293b;
      color: white;
      border-radius: 20px;
      padding: 1.75rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .callout-content h4 {
      font-size: 1.15rem;
      font-weight: 800;
      margin: 0 0 4px;
      color: white;
    }
    .callout-content p {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0;
    }
    .callout-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .btn-support-call {
      background: #ea580c;
      color: white;
      padding: 10px 18px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
    }
    .btn-support-wa {
      background: #22c55e;
      color: white;
      padding: 10px 18px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
    }
  `]
})
export class CmsTiffinFaqComponent implements OnInit {
  @Input() section!: CmsSection;

  openIndex: number | null = 0;

  faqs = [
    {
      q: 'Can I pause or skip meals if I am traveling or on leave?',
      a: '<strong>Yes, absolutely!</strong> You can pause or resume your subscription anytime with zero penalty. Simply notify us via WhatsApp or your customer account before 9:00 AM for lunch or before 4:00 PM for dinner.'
    },
    {
      q: 'What are the delivery timings in Meerut?',
      a: '<strong>Lunch:</strong> Delivered hot between 12:30 PM and 02:00 PM.<br><strong>Dinner:</strong> Delivered piping hot between 07:30 PM and 09:30 PM right to your doorstep or office desk.'
    },
    {
      q: 'Can I order a 1-time trial meal before committing to a weekly or monthly plan?',
      a: '<strong>Yes!</strong> Select the <strong>1-Time / Trial</strong> tab on any thali to place an instant single meal order. You can test our taste, delivery punctuality, and hygiene before subscribing.'
    },
    {
      q: 'How is the food packed and delivered?',
      a: 'We use high-grade, microwave-safe, 100% sanitized multi-compartment containers. Each box is packed hot and transported in insulated thermal bags to ensure warmth and fresh aroma.'
    },
    {
      q: 'Do you offer pure Jain (No-Onion-No-Garlic) meals?',
      a: '<strong>Yes!</strong> All our Jain thalis are prepared in a dedicated, sanitized section of our kitchen with separate utensils and pure desi ghee.'
    }
  ];

  ngOnInit() {
    if (this.section?.items?.length) {
      this.faqs = this.section.items.map(it => ({
        q: it.title || '',
        a: it.description || ''
      }));
    }
  }

  toggleFaq(index: number) {
    this.openIndex = this.openIndex === index ? null : index;
  }
}

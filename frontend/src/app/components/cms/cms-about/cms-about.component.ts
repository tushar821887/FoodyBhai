import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsSection } from '../../../models/cms.model';

@Component({
  selector: 'app-cms-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="section about-section"
             [class.is-light-text]="section.style.textColor === '#ffffff'"
             [style.padding-top]="section.style.paddingTop || '60px'"
             [style.padding-bottom]="section.style.paddingBottom || '60px'"
             [style.background-color]="section.style.backgroundColor || 'var(--background-white)'"
             [style.background]="section.style.backgroundGradient || section.style.backgroundColor || 'var(--background-white)'"
             [style.color]="section.style.textColor || 'inherit'">
      <div class="container" [style.max-width]="section.style.maxWidth || '1200px'">
        <div class="about-grid" [class.reverse-layout]="section.imagePosition === 'right'">
          
          <!-- Image Column -->
          <div *ngIf="section.imageUrl" class="about-img animate-fade-in" [style.border-radius]="section.style.borderRadius || '30px'">
            <img [src]="section.imageUrl" [alt]="section.title || 'Cooking healthy food'"
                 onerror="this.src='https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80'">
          </div>

          <!-- Content Column -->
          <div class="about-content animate-fade-in" [style.text-align]="section.style.textAlign || 'left'">
            <div *ngIf="section.badge" class="cms-badge">
              {{ section.badge }}
            </div>

            <h2 class="section-title"
                [style.color]="section.style.textColor || 'var(--secondary-color, #241814)'"
                [style.font-size]="section.style.titleFontSize || '2.5rem'"
                [innerHTML]="section.title || 'Welcome to <span>FoodyBhai</span>'"></h2>

            <p *ngIf="section.subtitle" class="section-subtitle"
               [style.color]="section.style.textColor ? (section.style.textColor === '#ffffff' ? 'rgba(255,255,255,0.85)' : section.style.textColor) : 'var(--text-light, #716661)'"
               [style.font-size]="section.style.contentFontSize || '1rem'">
              {{ section.subtitle }}
            </p>

            <!-- Rich Content from WYSIWYG Editor -->
            <div *ngIf="section.content" class="about-rich-html" [innerHTML]="section.content"></div>

            <!-- Bullet List Features -->
            <ul *ngIf="section.items && section.items.length > 0" class="features-list">
              <li *ngFor="let item of section.items">
                <div class="feature-icon">
                  <i *ngIf="item.icon && item.icon.includes('fa-')" [class]="item.icon"></i>
                  <span *ngIf="!item.icon || !item.icon.includes('fa-')">{{ item.icon || '✓' }}</span>
                </div>
                <div class="feature-text">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.description }}</p>
                </div>
              </li>
            </ul>

            <div *ngIf="section.buttonText" style="margin-top: 2rem;">
              <a [routerLink]="section.buttonLink || '/menu'" class="btn btn-primary">
                {{ section.buttonText }}
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  `,
  styles: [`
    .about-section {
      position: relative;
      width: 100%;
    }
    .about-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }
    .about-grid.reverse-layout {
      grid-template-columns: 1fr 1fr;
    }
    .about-grid.reverse-layout .about-content {
      order: 1;
    }
    .about-grid.reverse-layout .about-img {
      order: 2;
    }
    .about-img {
      border-radius: 30px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      position: relative;
    }
    .about-img img {
      width: 100%;
      height: 100%;
      max-height: 480px;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
    }
    .about-img:hover img {
      transform: scale(1.02);
    }
    .cms-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      background: var(--primary-light, #fff5ed);
      color: var(--primary-color, #ea580c);
      border: 1.5px solid var(--primary-border, #fed7aa);
      border-radius: 50px;
      font-weight: 700;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
      margin-bottom: 1rem;
      text-transform: uppercase;
    }
    .section-title {
      font-size: 2.5rem;
      font-weight: 800;
      line-height: 1.25;
      margin-bottom: 1rem;
      color: var(--secondary-color, #241814);
    }
    :host ::ng-deep .section-title span {
      color: var(--primary-color, #ea580c);
    }
    :host ::ng-deep .about-section.is-light-text .section-title span,
    .about-section.is-light-text :host ::ng-deep .section-title span {
      color: #fde047 !important;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    }
    .about-section.is-light-text .about-rich-html {
      color: rgba(255, 255, 255, 0.9) !important;
    }
    .about-section.is-light-text .feature-text h4 {
      color: #ffffff !important;
    }
    .about-section.is-light-text .feature-text p {
      color: rgba(255, 255, 255, 0.8) !important;
    }
    .section-subtitle {
      font-size: 1.05rem;
      line-height: 1.6;
      color: var(--text-light, #716661);
      margin-bottom: 1.5rem;
    }
    .about-rich-html {
      line-height: 1.7;
      color: var(--text-dark, #334155);
      margin-bottom: 1.5rem;
    }
    .features-list {
      list-style: none;
      padding: 0;
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .features-list li {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
    }
    .feature-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: var(--primary-light, #fff5ed);
      border: 1.5px solid var(--primary-border, #fed7aa);
      color: var(--primary-color, #ea580c);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }
    .features-list li:hover .feature-icon {
      background: var(--primary-gradient, linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%));
      color: #fff;
      border-color: transparent;
      transform: translateY(-3px);
      box-shadow: 0 6px 16px var(--primary-glow, rgba(234, 88, 12, 0.25));
    }
    .feature-text h4 {
      margin: 0 0 0.35rem;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--secondary-color, #241814);
    }
    .feature-text p {
      margin: 0;
      font-size: 0.95rem;
      color: var(--text-light, #716661);
      line-height: 1.5;
    }
    @media (max-width: 992px) {
      .about-grid {
        grid-template-columns: 1fr !important;
        gap: 2rem;
      }
      .about-grid.reverse-layout .about-content {
        order: 2;
      }
      .about-grid.reverse-layout .about-img {
        order: 1;
      }
    }
    @media (max-width: 768px) {
      .about-img {
        border-radius: 18px;
        max-height: 220px;
      }
      .about-img img {
        height: 210px;
        width: 100%;
        object-fit: cover;
      }
      .features-list {
        margin-top: 1.25rem;
        gap: 1rem;
      }
      .feature-icon {
        width: 44px;
        height: 44px;
        font-size: 1.15rem;
        border-radius: 12px;
      }
      .feature-text h4 {
        font-size: 0.98rem;
      }
      .feature-text p {
        font-size: 0.85rem;
      }
    }
  `]
})
export class CmsAboutComponent {
  @Input() section!: CmsSection;
}

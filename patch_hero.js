const fs = require('fs');
const path = require('path');

// --- hero.ts ---
const tsPath = path.join(__dirname, 'frontend', 'src', 'app', 'components', 'hero', 'hero.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

const newImports = `import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';`;

tsContent = tsContent.replace(/import { Component } from '@angular\/core';\nimport { RouterLink } from '@angular\/router';/, newImports);

const newComponent = `export class Hero implements OnInit {
  restaurantStats: any = { averageRating: 4.1, totalReviews: 0 };
  
  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.orderService.getRestaurantStats().subscribe({
        next: (stats) => {
          if (stats && stats.totalReviews > 0) {
            this.restaurantStats = stats;
            this.cdr.detectChanges();
          }
        },
        error: (err) => console.error(err)
      });
    }
  }

  openZomatoStore(){
    window.location.href='https://www.zomato.com/meerut/foody-bhai-mohan-puri/order';
  }
}`;

tsContent = tsContent.replace(/export class Hero \{[\s\S]*\}/, newComponent);
tsContent = tsContent.replace("imports: [RouterLink]", "imports: [RouterLink, CommonModule]");
fs.writeFileSync(tsPath, tsContent);


// --- hero.html ---
const htmlPath = path.join(__dirname, 'frontend', 'src', 'app', 'components', 'hero', 'hero.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Replace stat
const oldStat = `<div class="stat">
          <span class="stat-number">4.1</span>
          <span class="stat-text">Customer Rating</span>
        </div>`;
const newStat = `<div class="stat">
          <span class="stat-number">{{ restaurantStats.averageRating | number:'1.1-1' }} <i class="fa-solid fa-star" style="color: #f59e0b; font-size: 0.8em;"></i></span>
          <span class="stat-text">Based on {{ restaurantStats.totalReviews || '200+' }} ratings</span>
        </div>`;
htmlContent = htmlContent.replace(oldStat, newStat);

// Replace floating card
const oldCard = `<div class="floating-card rating-card">
          <i class="fa-solid fa-star"></i>
          <div>
            <strong>4.1/5</strong>
            <span>Zomato Rating</span>
          </div>
        </div>`;
const newCard = `<div class="floating-card rating-card" style="display: flex; align-items: center; gap: 10px; background: white; padding: 10px 15px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <i class="fa-solid fa-star" style="color: #f59e0b; font-size: 24px;"></i>
          <div>
            <strong style="display: block; font-size: 18px; color: #1e293b;">{{ restaurantStats.averageRating | number:'1.1-1' }}/5</strong>
            <span style="font-size: 12px; color: #64748b;">Foody Bhai Rating</span>
          </div>
        </div>`;
htmlContent = htmlContent.replace(oldCard, newCard);

fs.writeFileSync(htmlPath, htmlContent);
console.log('Fixed hero component');

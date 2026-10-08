const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, 'frontend/src/app/app.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

if (!tsContent.includes('OrderService')) {
  tsContent = tsContent.replace("import { LocationModalComponent } from './components/location-modal/location-modal';", "import { LocationModalComponent } from './components/location-modal/location-modal';\nimport { OrderService } from './services/order.service';\nimport { CommonModule } from '@angular/common';");
  tsContent = tsContent.replace("imports: [RouterOutlet, Header, Footer, LocationModalComponent],", "imports: [CommonModule, RouterOutlet, Header, Footer, LocationModalComponent],");
  tsContent = tsContent.replace("private location: Location,", "private location: Location,\n    private orderService: OrderService,");
  tsContent = tsContent.replace("protected readonly title = signal('Foody Bhai');", "protected readonly title = signal('Foody Bhai');\n  restaurantOpen = true;\n  restaurantClosedReason = '';");
  tsContent = tsContent.replace("this.setupBackButton();", "this.setupBackButton();\n      this.orderService.getSetting('restaurant_open').subscribe(res => {\n        if (res && res.value !== undefined) this.restaurantOpen = res.value === 'true' || res.value === true;\n      });\n      this.orderService.getSetting('restaurant_closed_reason').subscribe(res => {\n        if (res && res.value) this.restaurantClosedReason = res.value;\n      });");
}
fs.writeFileSync(tsPath, tsContent);

const htmlPath = path.join(__dirname, 'frontend/src/app/app.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const banner = `
<div *ngIf="!restaurantOpen" style="background: #ef4444; color: white; text-align: center; padding: 10px 15px; font-weight: 500; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; z-index: 9999; position: relative;">
  <span style="font-size: 18px;">⚠️</span>
  <span>{{ restaurantClosedReason || 'We are currently not accepting orders. Please check back later.' }}</span>
</div>
`;

if (!htmlContent.includes('restaurantOpen')) {
  htmlContent = banner + htmlContent;
}
fs.writeFileSync(htmlPath, htmlContent);


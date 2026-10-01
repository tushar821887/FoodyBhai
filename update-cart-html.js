const fs = require('fs');
const path = 'frontend/src/app/pages/cart/cart.html';
let content = fs.readFileSync(path, 'utf8');

// Insert orderType radio toggle at the beginning of Step 2 (Delivery Details)
const radioToggle = `
      <!-- Order Type Selection -->
      <div class="order-type-toggle">
        <label class="radio-label">
          <input type="radio" name="orderType" value="delivery" [(ngModel)]="orderType">
          <span>🛵 Delivery</span>
        </label>
        <label class="radio-label">
          <input type="radio" name="orderType" value="pickup" [(ngModel)]="orderType">
          <span>🚶 Self Pickup</span>
        </label>
      </div>
`;

content = content.replace(/<div class="step-content" \*ngIf="currentStep === 2">/, `<div class="step-content" *ngIf="currentStep === 2">
${radioToggle}`);

// Hide address fields if pickup
content = content.replace(/<div class="address-section" \*ngIf="authService.isLoggedIn\(\)">/, `<div class="address-section" *ngIf="authService.isLoggedIn() && orderType === 'delivery'">`);
content = content.replace(/<div class="form-group" \*ngIf="!authService.isLoggedIn\(\)">/, `<div class="form-group" *ngIf="!authService.isLoggedIn() && orderType === 'delivery'">`);

fs.writeFileSync(path, content);

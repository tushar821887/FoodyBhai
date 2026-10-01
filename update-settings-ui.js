const fs = require('fs');

// Update TS
const tsPath = 'admin-app/src/app/pages/orders/orders.page.ts';
let ts = fs.readFileSync(tsPath, 'utf8');

if (!ts.includes('onFileSelected(event: any)')) {
  ts = ts.replace(/saveSettings\(\) \{/, `onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.qrImageUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveSettings() {`);
  fs.writeFileSync(tsPath, ts);
}

// Update HTML
const htmlPath = 'admin-app/src/app/pages/orders/orders.page.html';
let html = fs.readFileSync(htmlPath, 'utf8');

const newSettingsHtml = `<!-- SETTINGS VIEW -->
    <ng-container *ngIf="currentView === 'settings'">
      <div class="settings-container animate-fade-in">
        <div class="settings-header-banner">
          <h2>Store Settings</h2>
          <p>Configure your payment gateway and store preferences.</p>
        </div>
        
        <div class="settings-card">
          <div class="card-header-styled">
            <div class="icon-circle">💰</div>
            <div>
              <h3>Payment Configuration</h3>
              <p>This QR code will be shown to delivery agents for collecting online payments.</p>
            </div>
          </div>
          
          <div class="settings-form-modern">
            <div class="form-group-modern">
              <label>Business UPI ID</label>
              <div class="input-with-icon">
                <span class="input-icon">🏦</span>
                <input type="text" [(ngModel)]="upiId" placeholder="e.g. foodybhai@okicici">
              </div>
            </div>
            
            <div class="form-group-modern">
              <label>Payment QR Code Image</label>
              <div class="qr-upload-area">
                
                <!-- Preview State -->
                <div class="qr-preview-card" *ngIf="qrImageUrl">
                  <img [src]="qrImageUrl" alt="QR Code Preview">
                  <div class="qr-actions">
                    <button class="btn-change-qr" (click)="fileInput.click()">Change Image</button>
                    <button class="btn-remove-qr" (click)="qrImageUrl = ''">Remove</button>
                  </div>
                </div>
                
                <!-- Upload State -->
                <div class="upload-dropzone" *ngIf="!qrImageUrl" (click)="fileInput.click()">
                  <div class="upload-icon">📸</div>
                  <h4>Upload QR Code</h4>
                  <p>Click to browse files (PNG, JPG)</p>
                </div>
                
                <input #fileInput type="file" accept="image/*" style="display: none;" (change)="onFileSelected($event)">
              </div>
            </div>

            <div class="settings-footer">
              <button class="btn-save-modern" (click)="saveSettings()">
                <span class="save-icon">💾</span> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </ng-container>`;

html = html.replace(/<!-- SETTINGS VIEW -->[\s\S]*?<\/ng-container>/, newSettingsHtml);
fs.writeFileSync(htmlPath, html);


const fs = require('fs');
let content = fs.readFileSync('admin-app/src/app/pages/orders/orders.page.html', 'utf8');

const modalHtml = `
<!-- Admin Reject/Cancel Order Modal -->
<div class="modal-overlay" *ngIf="showAdminRejectModal">
  <div class="modal-content assign-modal" style="max-width: 400px;">
    <div class="modal-header">
      <div class="modal-icon-wrapper" style="background: #fef2f2; color: #ef4444;">
        <span class="modal-icon">⚠️</span>
      </div>
      <h3>Cancel Order</h3>
      <p class="modal-subtitle">Please provide a reason for cancelling this order.</p>
    </div>
    
    <div class="settings-form-modern" style="padding: 0; margin-bottom: 20px;">
      <div class="form-group-modern" style="margin-bottom: 0;">
        <div class="input-with-icon">
          <textarea [(ngModel)]="adminRejectReason" placeholder="Reason for cancellation (e.g. Out of stock, Store closing)..." rows="3" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; resize: vertical;"></textarea>
        </div>
      </div>
    </div>

    <div class="modal-actions full-width">
      <button class="btn-cancel-modal" (click)="showAdminRejectModal = false">Cancel</button>
      <button class="btn-dispatch-modal" style="background: #ef4444; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);" [disabled]="!adminRejectReason.trim()" (click)="confirmAdminReject()">
        Confirm Cancellation
      </button>
    </div>
  </div>
</div>
`;

content = content.replace(/<\/div>\s*$/, modalHtml + '\n');
fs.writeFileSync('admin-app/src/app/pages/orders/orders.page.html', content);
console.log('patched html');

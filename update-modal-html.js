const fs = require('fs');
const path = 'admin-app/src/app/pages/orders/orders.page.html';
let content = fs.readFileSync(path, 'utf8');

const newModal = `<!-- Assign Agent Modal -->
<div class="modal-overlay" *ngIf="showAssignModal">
  <div class="modal-content assign-modal">
    <div class="modal-header">
      <div class="modal-icon-wrapper">
        <span class="modal-icon">🛵</span>
      </div>
      <h3>Dispatch Order</h3>
      <p class="modal-subtitle">Select a delivery partner to assign this order to.</p>
    </div>
    
    <div class="agents-selection-list">
      <div class="agent-select-item" *ngFor="let agent of agents" (click)="assignAgent(agent)" [class.selected]="selectedAgent?.id === agent.id">
        <div class="agent-avatar">{{ agent.name.charAt(0).toUpperCase() }}</div>
        <div class="agent-details">
          <strong>{{ agent.name }}</strong>
          <span>{{ agent.phone }}</span>
        </div>
        <div class="agent-check">
          <svg *ngIf="selectedAgent?.id === agent.id" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      </div>
      <div *ngIf="agents.length === 0" class="empty-state">
        <p>No delivery agents available.</p>
      </div>
    </div>
    <div class="modal-actions full-width">
      <button class="btn-cancel-modal" (click)="showAssignModal = false">Cancel</button>
      <button class="btn-dispatch-modal" [disabled]="!selectedAgent" (click)="confirmOutForDelivery()">
        Assign & Dispatch
      </button>
    </div>
  </div>
</div>`;

content = content.replace(/<!-- Assign Agent Modal -->[\s\S]*?<\/div>\n<\/div>/, newModal);

fs.writeFileSync(path, content);

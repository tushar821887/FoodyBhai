const fs = require('fs');
const path = 'admin-app/src/app/pages/orders/orders.page.html';
let content = fs.readFileSync(path, 'utf8');

// Update Sidebar Links
content = content.replace(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/, `<nav class="sidebar-nav">
      <a class="nav-item" [class.active]="currentView === 'dashboard'" (click)="setView('dashboard')">
        <i class="icon">📊</i>
        <span>Dashboard</span>
      </a>
      <a class="nav-item" [class.active]="currentView === 'agents'" (click)="setView('agents')">
        <i class="icon">🛵</i>
        <span>Delivery Agents</span>
      </a>
      <a class="nav-item">
        <i class="icon">🍽️</i>
        <span>Menu</span>
      </a>
    </nav>`);

// Wrap Main Content inside an ngIf for dashboard
content = content.replace(/<div class="top-bar">/, `<!-- DASHBOARD VIEW -->
    <ng-container *ngIf="currentView === 'dashboard'">
    <div class="top-bar">`);

content = content.replace(/<\/main>/, `</ng-container>

    <!-- AGENTS VIEW -->
    <ng-container *ngIf="currentView === 'agents'">
      <div class="agents-container">
        <h2>Delivery Agents</h2>
        
        <div class="add-agent-card">
          <h3>Add New Agent</h3>
          <div class="form-group">
            <input type="text" placeholder="Agent Name" [(ngModel)]="newAgentName">
            <input type="text" placeholder="Phone Number" [(ngModel)]="newAgentPhone">
            <button (click)="addAgent()" [disabled]="isAddingAgent">Add Agent</button>
          </div>
        </div>

        <div class="agents-list">
          <div class="agent-card" *ngFor="let agent of agents">
            <div class="agent-info">
              <h4>{{ agent.name }}</h4>
              <p>📞 {{ agent.phone }}</p>
            </div>
            <button class="btn-delete" (click)="deleteAgent(agent.id)">Delete</button>
          </div>
          <div *ngIf="agents.length === 0" class="empty-state">No agents added yet.</div>
        </div>
      </div>
    </ng-container>

  </main>`);

// Update Out for Delivery button
content = content.replace(/<button class="btn-action" \*ngIf="order\.status === 'ready'" \(click\)="updateStatus\(order\._id!, 'out_for_delivery'\)">Out for Delivery<\/button>/, `<button class="btn-action" *ngIf="order.status === 'ready' && order.orderType === 'delivery'" (click)="openAssignAgentModal(order._id!)">Out for Delivery</button>
<button class="btn-action" *ngIf="order.status === 'ready' && order.orderType === 'pickup'" (click)="updateStatus(order._id!, 'delivered')">Mark Picked Up</button>`);

// Add Assign Agent Modal
content += `
<!-- Assign Agent Modal -->
<div class="modal-overlay" *ngIf="showAssignModal">
  <div class="modal-content">
    <h3>Assign Delivery Agent</h3>
    <div class="agents-selection-list">
      <div class="agent-select-item" *ngFor="let agent of agents" (click)="assignAgent(agent)" [class.selected]="selectedAgent?.id === agent.id">
        <strong>{{ agent.name }}</strong> ({{ agent.phone }})
      </div>
      <div *ngIf="agents.length === 0" class="empty-state">Please add Delivery Agents from the sidebar first.</div>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" (click)="showAssignModal = false">Cancel</button>
      <button class="btn-primary" [disabled]="!selectedAgent" (click)="confirmOutForDelivery()">Assign & Dispatch</button>
    </div>
  </div>
</div>
`;

fs.writeFileSync(path, content);

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'admin-app', 'src', 'app', 'pages', 'orders', 'orders.page.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// Add to desktop sidebar
const desktopSidebarLink = `
      <a class="nav-item" [class.active]="currentView === 'users'" (click)="setView('users')">
        <i class="icon">👥</i>
        <span>Users</span>
      </a>
      <a class="nav-item" [class.active]="currentView === 'settings'" (click)="setView('settings')">`;
content = content.replace(`<a class="nav-item" [class.active]="currentView === 'settings'" (click)="setView('settings')">`, desktopSidebarLink);

// Add to mobile nav
const mobileNavLink = `
  <a class="nav-item" [class.active]="currentView === 'users'" (click)="setView('users')">
    <i class="icon">👥</i>
    <span>Users</span>
  </a>
  <a class="nav-item" [class.active]="currentView === 'settings'" (click)="setView('settings')">`;
content = content.replace(`<a class="nav-item" [class.active]="currentView === 'settings'" (click)="setView('settings')">`, mobileNavLink);

// Add Users view
const usersView = `
    <!-- USERS VIEW -->
    <ng-container *ngIf="currentView === 'users'">
      <div class="agents-container animate-fade-in">
        <div class="settings-header-banner" style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); margin-bottom: 20px; border-radius: 12px; padding: 25px; color: white;">
          <h2 style="margin: 0 0 5px 0; font-size: 24px; font-weight: 700;">Customer Management</h2>
          <p style="margin: 0; opacity: 0.9; font-size: 15px;">View and manage your registered customers.</p>
        </div>
        
        <div class="settings-card">
          <div class="card-header-styled">
            <div class="icon-circle" style="background: #ede9fe; color: #8b5cf6;">👥</div>
            <div><h3>Registered Users</h3></div>
          </div>
          <div style="padding: 20px;">
            <div *ngFor="let user of users" class="recipe-list-item" style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #e2e8f0; gap: 15px;">
              <div style="width: 50px; height: 50px; border-radius: 25px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; color: #64748b;">
                {{ user.name?.charAt(0)?.toUpperCase() || 'U' }}
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <strong style="font-size: 16px;">{{ user.name }}</strong>
                </div>
                <div style="font-size: 13px; color: #64748b; margin-top: 5px;">📧 {{ user.email }}</div>
                <div style="font-size: 13px; color: #64748b; margin-top: 2px;">📞 {{ user.phone || 'No phone' }}</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <button style="color: #3b82f6; background: #eff6ff; border: none; cursor: pointer; font-weight: 600; padding: 6px 12px; border-radius: 6px;" (click)="editUser(user)">Edit</button>
                <button style="color: #ef4444; background: #fef2f2; border: none; cursor: pointer; font-weight: 600; padding: 6px 12px; border-radius: 6px;" (click)="deleteUser(user._id || user.id)">Delete</button>
              </div>
            </div>
            <div *ngIf="users.length === 0" style="color: #64748b; text-align: center; padding: 30px;">No users found.</div>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- SETTINGS VIEW -->`;
content = content.replace(`<!-- SETTINGS VIEW -->`, usersView);

const editUserModal = `
<!-- Edit User Modal -->
<div class="modal-overlay" *ngIf="showEditUserModal">
  <div class="modal-content assign-modal" style="max-width: 400px;">
    <div class="modal-header">
      <div class="modal-icon-wrapper" style="background: #ede9fe; color: #8b5cf6;">
        <span class="modal-icon">✏️</span>
      </div>
      <h3>Edit User</h3>
    </div>
    
    <div class="settings-form-modern" style="padding: 0; display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px;" *ngIf="editingUser">
      <div class="form-group-modern" style="margin-bottom: 0;">
        <label>Name</label>
        <div class="input-with-icon">
          <input type="text" [(ngModel)]="editingUser.name" placeholder="Full Name">
        </div>
      </div>
      <div class="form-group-modern" style="margin-bottom: 0;">
        <label>Email</label>
        <div class="input-with-icon">
          <input type="email" [(ngModel)]="editingUser.email" placeholder="Email Address">
        </div>
      </div>
      <div class="form-group-modern" style="margin-bottom: 0;">
        <label>Phone</label>
        <div class="input-with-icon">
          <input type="text" [(ngModel)]="editingUser.phone" placeholder="Phone Number">
        </div>
      </div>
      <div class="form-group-modern" style="margin-bottom: 0;">
        <label>New Password (Optional)</label>
        <div class="input-with-icon">
          <input type="password" [(ngModel)]="editingUser.password" placeholder="Leave blank to keep current">
        </div>
      </div>
    </div>

    <div class="modal-actions full-width">
      <button class="btn-cancel-modal" (click)="showEditUserModal = false">Cancel</button>
      <button class="btn-dispatch-modal" style="background: #8b5cf6; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);" (click)="saveUserEdit()">
        Save Changes
      </button>
    </div>
  </div>
</div>

<!-- Mobile Bottom Navigation -->`;
content = content.replace(`<!-- Mobile Bottom Navigation -->`, editUserModal);

fs.writeFileSync(htmlPath, content);
console.log('orders.page.html updated');

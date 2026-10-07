const fs = require('fs');
const path = require('path');

// 1. Patch HTML
const htmlPath = path.join(__dirname, 'admin-app', 'src', 'app', 'pages', 'agents', 'agents.page.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const oldForm = `<div class="form-group">
      <input type="text" placeholder="Agent Name" [(ngModel)]="newName">
      <input type="text" placeholder="Phone Number" [(ngModel)]="newPhone">
      <button (click)="addAgent()" [disabled]="isAdding">Add Agent</button>
    </div>`;

const newForm = `<div class="form-group" style="display: flex; flex-direction: column; gap: 15px;">
      <div style="display: flex; gap: 15px;">
        <input type="text" placeholder="Agent Name" [(ngModel)]="newName" style="flex:1;">
        <input type="text" placeholder="Phone Number" [(ngModel)]="newPhone" style="flex:1;">
      </div>
      <div style="display: flex; gap: 15px;">
        <input type="email" placeholder="Login Email (Optional)" [(ngModel)]="newEmail" style="flex:1;">
        <input type="password" placeholder="Login Password (Optional)" [(ngModel)]="newPassword" style="flex:1;">
      </div>
      <button (click)="addAgent()" [disabled]="isAdding" style="align-self: flex-start;">Add Agent</button>
    </div>`;

htmlContent = htmlContent.replace(oldForm, newForm);

htmlContent = htmlContent.replace(
  "<h4>{{ agent.name }}</h4>",
  "<h4>{{ agent.name }} <span *ngIf=\"agent.email\" style=\"font-size:12px; color: #888;\">({{ agent.email }})</span></h4>"
);
fs.writeFileSync(htmlPath, htmlContent);

// 2. Patch TS
const tsPath = path.join(__dirname, 'admin-app', 'src', 'app', 'pages', 'agents', 'agents.page.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

tsContent = tsContent.replace("newPhone = '';", "newPhone = '';\n  newEmail = '';\n  newPassword = '';");
tsContent = tsContent.replace("this.api.addAgent(this.newName, this.newPhone)", "this.api.addAgent(this.newName, this.newPhone, this.newEmail, this.newPassword)");
tsContent = tsContent.replace("this.newPhone = '';", "this.newPhone = '';\n        this.newEmail = '';\n        this.newPassword = '';");

fs.writeFileSync(tsPath, tsContent);

// 3. Patch api.service.ts
const apiPath = path.join(__dirname, 'admin-app', 'src', 'app', 'services', 'api.service.ts');
let apiContent = fs.readFileSync(apiPath, 'utf8');

apiContent = apiContent.replace(
  "addAgent(name: string, phone: string)",
  "addAgent(name: string, phone: string, email?: string, password?: string)"
);
apiContent = apiContent.replace(
  "return this.http.post(`${this.baseUrl}/agents`, { name, phone });",
  "return this.http.post(`${this.baseUrl}/agents`, { name, phone, email, password });"
);

// Add email to Agent interface
apiContent = apiContent.replace(
  "name: string;\n  phone: string;",
  "name: string;\n  phone: string;\n  email?: string;"
);

fs.writeFileSync(apiPath, apiContent);

console.log('Patched UI for agent credentials');

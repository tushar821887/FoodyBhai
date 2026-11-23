const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'admin-app', 'src', 'app', 'pages', 'orders', 'orders.page.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const oldForm = `<div class="form-group">
            <input type="text" placeholder="Agent Name" [(ngModel)]="newAgentName">
            <input type="text" placeholder="Phone Number" [(ngModel)]="newAgentPhone">
            <button (click)="addAgent()" [disabled]="isAddingAgent">Add Agent</button>
          </div>`;

const newForm = `<div class="form-group" style="display: flex; flex-direction: column; gap: 15px;">
            <div style="display: flex; gap: 15px;">
              <input type="text" placeholder="Agent Name" [(ngModel)]="newAgentName" style="flex:1;">
              <input type="text" placeholder="Phone Number" [(ngModel)]="newAgentPhone" style="flex:1;">
            </div>
            <div style="display: flex; gap: 15px;">
              <input type="email" placeholder="Login Email (Optional)" [(ngModel)]="newAgentEmail" style="flex:1;">
              <input type="password" placeholder="Login Password (Optional)" [(ngModel)]="newAgentPassword" style="flex:1;">
            </div>
            <button (click)="addAgent()" [disabled]="isAddingAgent" style="align-self: flex-start;">Add Agent</button>
          </div>`;

htmlContent = htmlContent.replace(oldForm, newForm);

htmlContent = htmlContent.replace(
  "<h4>{{ agent.name }}</h4>",
  "<h4>{{ agent.name }} <span *ngIf=\"agent.email\" style=\"font-size:12px; color: #888;\">({{ agent.email }})</span></h4>"
);

fs.writeFileSync(htmlPath, htmlContent);

const tsPath = path.join(__dirname, 'admin-app', 'src', 'app', 'pages', 'orders', 'orders.page.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

tsContent = tsContent.replace(
  "newAgentPhone = '';",
  "newAgentPhone = '';\n  newAgentEmail = '';\n  newAgentPassword = '';"
);

tsContent = tsContent.replace(
  "this.api.addAgent(this.newAgentName, this.newAgentPhone)",
  "this.api.addAgent(this.newAgentName, this.newAgentPhone, this.newAgentEmail, this.newAgentPassword)"
);

tsContent = tsContent.replace(
  "this.newAgentPhone = '';",
  "this.newAgentPhone = '';\n        this.newAgentEmail = '';\n        this.newAgentPassword = '';"
);

fs.writeFileSync(tsPath, tsContent);
console.log('Patched real agents UI');

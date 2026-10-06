const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'admin-app', 'src', 'app', 'pages', 'orders', 'orders.page.ts');
let content = fs.readFileSync(pagePath, 'utf8');

content = content.replace("currentView: 'dashboard' | 'agents' | 'settings' | 'menu' = 'dashboard';",
                          "currentView: 'dashboard' | 'agents' | 'settings' | 'menu' | 'users' = 'dashboard';");

content = content.replace("setView(view: 'dashboard' | 'agents' | 'settings' | 'menu')",
                          "setView(view: 'dashboard' | 'agents' | 'settings' | 'menu' | 'users')");

const userProps = `
  users: any[] = [];
  editingUser: any = null;
  showEditUserModal = false;
`;
content = content.replace("agents: any[] = [];", userProps + "\n  agents: any[] = [];");

const userMethods = `
  fetchUsers() {
    this.api.getUsers().subscribe(data => this.users = data);
  }

  editUser(user: any) {
    this.editingUser = { ...user, password: '' };
    this.showEditUserModal = true;
  }

  saveUserEdit() {
    if(!this.editingUser) return;
    const updateData = {
      name: this.editingUser.name,
      email: this.editingUser.email,
      phone: this.editingUser.phone
    };
    if (this.editingUser.password) {
      (updateData as any).password = this.editingUser.password;
    }
    
    this.api.updateUser(this.editingUser._id || this.editingUser.id, updateData).subscribe(() => {
      this.showEditUserModal = false;
      this.editingUser = null;
      this.fetchUsers();
    });
  }

  deleteUser(id: string) {
    if(confirm('Delete this user?')) {
      this.api.deleteUser(id).subscribe(() => this.fetchUsers());
    }
  }
`;

content = content.replace("fetchAgents() {", userMethods + "\n  fetchAgents() {");

content = content.replace("if (view === 'agents') {",
                          "if (view === 'agents') {\n      this.fetchAgents();\n    }\n    if (view === 'users') {\n      this.fetchUsers();\n    }");
// we might have replaced `if (view === 'agents') { \n this.fetchAgents(); \n }` incorrectly, let's be careful. Let's fix this in the script.


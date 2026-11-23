const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'admin-app', 'src', 'app', 'pages', 'orders', 'orders.page.ts');
let content = fs.readFileSync(pagePath, 'utf8');

// Revert any possible mess up from previous script (though it ran fine, let's just make sure)
// Actually let's just use string replacement carefully.

if (!content.includes('users: any[] = [];')) {
  content = content.replace("currentView: 'dashboard' | 'agents' | 'settings' | 'menu' = 'dashboard';",
                            "currentView: 'dashboard' | 'agents' | 'settings' | 'menu' | 'users' = 'dashboard';");

  content = content.replace("setView(view: 'dashboard' | 'agents' | 'settings' | 'menu')",
                            "setView(view: 'dashboard' | 'agents' | 'settings' | 'menu' | 'users')");

  content = content.replace("agents: any[] = [];", 
`users: any[] = [];
  editingUser: any = null;
  showEditUserModal = false;
  agents: any[] = [];`);

  content = content.replace("fetchAgents() {", 
`fetchUsers() {
    this.api.getUsers().subscribe(data => this.users = data);
  }

  editUser(user: any) {
    this.editingUser = { ...user, password: '' };
    this.showEditUserModal = true;
  }

  saveUserEdit() {
    if(!this.editingUser) return;
    const updateData: any = {
      name: this.editingUser.name,
      email: this.editingUser.email,
      phone: this.editingUser.phone
    };
    if (this.editingUser.password) {
      updateData.password = this.editingUser.password;
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

  fetchAgents() {`);

  content = content.replace("if (view === 'agents') {\n      this.fetchAgents();\n    }",
`if (view === 'agents') {
      this.fetchAgents();
    }
    if (view === 'users') {
      this.fetchUsers();
    }`);

  fs.writeFileSync(pagePath, content);
  console.log('orders.page.ts updated');
} else {
  console.log('Already patched');
}

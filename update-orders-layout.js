const fs = require('fs');
const path = 'admin-app/src/app/pages/orders/orders.page.ts';
let content = fs.readFileSync(path, 'utf8');

// Add currentView property and agents logic
content = content.replace(/currentTab: string = 'pending';/, `currentTab: string = 'pending';
  currentView: 'dashboard' | 'agents' = 'dashboard';
  agents: any[] = [];
  newAgentName = '';
  newAgentPhone = '';
  isAddingAgent = false;`);

// Add agents methods
content = content.replace(/logout\(\) \{/, `
  setView(view: 'dashboard' | 'agents') {
    this.currentView = view;
    if (view === 'agents') {
      this.fetchAgents();
    }
  }

  fetchAgents() {
    this.api.getAgents().subscribe(data => this.agents = data);
  }

  addAgent() {
    if(!this.newAgentName || !this.newAgentPhone) return;
    this.isAddingAgent = true;
    this.api.addAgent(this.newAgentName, this.newAgentPhone).subscribe({
      next: () => {
        this.newAgentName = '';
        this.newAgentPhone = '';
        this.isAddingAgent = false;
        this.fetchAgents();
      },
      error: () => this.isAddingAgent = false
    });
  }

  deleteAgent(id: string) {
    if(confirm('Delete this agent?')) {
      this.api.deleteAgent(id).subscribe(() => this.fetchAgents());
    }
  }

  logout() {`);

fs.writeFileSync(path, content);

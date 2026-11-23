import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Agent } from '../../services/api.service';

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agents.page.html',
  styleUrl: './agents.page.css'
})
export class AgentsPage implements OnInit {
  agents: Agent[] = [];
  newName = '';
  newPhone = '';
  newEmail = '';
  newPassword = '';
  isAdding = false;

  editingAgentId: string | null = null;
  editName = '';
  editPhone = '';
  editEmail = '';
  editPassword = '';
  isSavingEdit = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.fetchAgents();
  }

  fetchAgents() {
    this.api.getAgents().subscribe(data => this.agents = data);
  }

  addAgent() {
    if(!this.newName || !this.newPhone) return;
    this.isAdding = true;
    this.api.addAgent(this.newName, this.newPhone, this.newEmail, this.newPassword).subscribe({
      next: () => {
        this.newName = '';
        this.newPhone = '';
        this.newEmail = '';
        this.newPassword = '';
        this.isAdding = false;
        this.fetchAgents();
      },
      error: () => this.isAdding = false
    });
  }

  deleteAgent(id: string) {
    if(confirm('Delete this agent?')) {
      this.api.deleteAgent(id).subscribe(() => this.fetchAgents());
    }
  }

  startEdit(agent: Agent) {
    this.editingAgentId = agent.id;
    this.editName = agent.name;
    this.editPhone = agent.phone;
    this.editEmail = agent.email || '';
    this.editPassword = ''; // leave blank, only update if typed
  }

  cancelEdit() {
    this.editingAgentId = null;
  }

  saveEdit() {
    if (!this.editingAgentId || !this.editName || !this.editPhone) return;
    this.isSavingEdit = true;
    this.api.updateAgent(this.editingAgentId, this.editName, this.editPhone, this.editEmail, this.editPassword || undefined).subscribe({
      next: () => {
        this.isSavingEdit = false;
        this.editingAgentId = null;
        this.fetchAgents();
      },
      error: () => this.isSavingEdit = false
    });
  }
}

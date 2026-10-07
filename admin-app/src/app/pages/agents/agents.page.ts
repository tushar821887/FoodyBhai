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
}

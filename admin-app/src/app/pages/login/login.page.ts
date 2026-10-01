import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css'
})
export class LoginPage {
  email = '';
  password = '';
  error = '';
  isLoading = false;

  constructor(private api: ApiService, private router: Router) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Please fill all fields';
      return;
    }
    
    this.isLoading = true;
    this.error = '';
    
    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.user?.role !== 'admin') {
          // Even if login succeeds, reject if not admin
          this.api.logout();
          this.error = 'Access denied. Admin only.';
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Invalid credentials';
      }
    });
  }
}

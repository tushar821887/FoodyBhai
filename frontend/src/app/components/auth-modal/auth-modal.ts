import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css'
})
export class AuthModalComponent {
  @Output() close = new EventEmitter<void>();

  isLoginMode = true;
  isLoading = false;
  errorMessage = '';

  formData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  closeModal() {
    this.close.emit();
  }

  onSubmit() {
    this.errorMessage = '';
    
    if (this.isLoginMode) {
      if (!this.formData.email || !this.formData.password) {
        this.errorMessage = 'Please fill in all fields';
        return;
      }

      this.isLoading = true;
      this.authService.login({ email: this.formData.email, password: this.formData.password }).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.closeModal();
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Login failed. Please check your credentials.';
        }
      });
    } else {
      if (!this.formData.name || !this.formData.email || !this.formData.password) {
        this.errorMessage = 'Please fill in all required fields';
        return;
      }

      if (this.formData.password !== this.formData.confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        return;
      }

      this.isLoading = true;
      this.authService.register({
        name: this.formData.name,
        email: this.formData.email,
        password: this.formData.password,
        phone: this.formData.phone
      }).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            // Automatically log them in after registration (or switch to login mode)
            this.authService.login({ email: this.formData.email, password: this.formData.password }).subscribe({
              next: () => this.closeModal(),
              error: () => this.toggleMode() // fallback to login mode
            });
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Registration failed. Please try again.';
        }
      });
    }
  }
}

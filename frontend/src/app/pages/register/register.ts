import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  registerData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };
  
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.errorMessage = '';

    if (!this.registerData.name || !this.registerData.email || !this.registerData.password) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;

    const { confirmPassword, ...apiData } = this.registerData;

    this.authService.register(apiData).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          // On successful registration, we can automatically log them in or redirect to login.
          // Let's redirect to login for simplicity.
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Registration failed. Please try again.';
      }
    });
  }
}

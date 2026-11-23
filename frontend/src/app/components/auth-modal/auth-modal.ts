import { Component, EventEmitter, Output, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
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
export class AuthModalComponent implements OnDestroy {
  @Output() close = new EventEmitter<void>();

  authMode: 'login' | 'register' | 'guest-lookup' | 'guest-set-password' | 'forgot-password' = 'login';
  isLoading = false;
  errorMessage = '';

  formData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };

  guestIdentifier = '';
  guestNewPassword = '';
  guestConfirmPassword = '';
  guestMessage = '';

  // Forgot Password / OTP State (Standard 3-Step Process)
  forgotIdentifier = '';
  forgotOtp = '';
  forgotResetToken = '';
  forgotNewPassword = '';
  forgotConfirmPassword = '';
  forgotStep: 'identifier' | 'verify' | 'new-password' = 'identifier';
  forgotSuccessMessage = '';
  forgotMaskedEmail = '';
  forgotMaskedPhone = '';
  showNewPassword = false;
  showConfirmPassword = false;
  resendCountdown = 0;
  private resendInterval: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    public cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnDestroy() {
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
      this.resendInterval = null;
    }
  }

  get isLoginMode(): boolean {
    return this.authMode === 'login';
  }

  switchToMode(mode: 'login' | 'register' | 'guest-lookup' | 'guest-set-password' | 'forgot-password') {
    this.authMode = mode;
    this.errorMessage = '';
    this.guestMessage = '';
    if (mode === 'guest-lookup' && this.formData.email) {
      this.guestIdentifier = this.formData.email;
    }
    if (mode === 'forgot-password') {
      this.forgotStep = 'identifier';
      this.forgotOtp = '';
      this.forgotResetToken = '';
      this.forgotNewPassword = '';
      this.forgotConfirmPassword = '';
      this.forgotSuccessMessage = '';
      if (this.formData.email) {
        this.forgotIdentifier = this.formData.email;
      }
    }
    this.cdr.detectChanges();
  }

  toggleMode() {
    this.switchToMode(this.authMode === 'login' ? 'register' : 'login');
  }

  closeModal() {
    this.close.emit();
  }

  backToIdentifier() {
    this.forgotStep = 'identifier';
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  toggleShowNewPassword() {
    this.showNewPassword = !this.showNewPassword;
    this.cdr.detectChanges();
  }

  toggleShowConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
    this.cdr.detectChanges();
  }

  // Step 1: Send OTP
  onSendForgotOtp() {
    this.errorMessage = '';
    this.forgotSuccessMessage = '';
    if (!this.forgotIdentifier.trim()) {
      this.errorMessage = 'Please enter your registered Email or 10-digit Phone Number.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.authService.sendForgotPasswordOtp(this.forgotIdentifier.trim()).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.forgotStep = 'verify';
          this.forgotSuccessMessage = res.message || 'Verification code sent successfully.';
          this.forgotMaskedEmail = res.maskedEmail || '';
          this.forgotMaskedPhone = res.maskedPhone || '';
          this.startResendTimer();
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Failed to send verification code. Please check your email/phone.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  startResendTimer() {
    this.resendCountdown = 30;
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
      this.resendInterval = null;
    }
    this.cdr.detectChanges();

    this.resendInterval = setInterval(() => {
      this.ngZone.run(() => {
        this.resendCountdown--;
        if (this.resendCountdown <= 0) {
          clearInterval(this.resendInterval);
          this.resendInterval = null;
        }
        this.cdr.detectChanges();
      });
    }, 1000);
  }

  // Step 2: Verify OTP
  onVerifyOtpSubmit() {
    this.errorMessage = '';
    const cleanOtp = (this.forgotOtp || '').trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      this.errorMessage = 'Please enter the complete 6-digit verification code.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.authService.verifyForgotPasswordOtp(this.forgotIdentifier.trim(), cleanOtp).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.forgotResetToken = res.resetToken;
          this.forgotStep = 'new-password';
          this.forgotSuccessMessage = res.message || 'Verification successful. Please create your new password below.';
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Invalid or expired OTP code. Please check and try again.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  // Step 3: Set New Password
  onSetNewPasswordSubmit() {
    this.errorMessage = '';
    if (!this.forgotNewPassword || this.forgotNewPassword.length < 6) {
      this.errorMessage = 'New password must be at least 6 characters long.';
      this.cdr.detectChanges();
      return;
    }
    if (this.forgotNewPassword !== this.forgotConfirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.forgotResetToken) {
      this.errorMessage = 'Password reset session has expired. Please verify OTP code again.';
      this.forgotStep = 'verify';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.authService.resetPasswordWithToken(
      this.forgotIdentifier.trim(),
      this.forgotResetToken,
      this.forgotNewPassword
    ).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          if (res.success) {
            this.closeModal();
            this.router.navigate(['/profile']);
          }
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Failed to update password. Please try again.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  onGuestLookupTrack() {
    if (!this.guestIdentifier.trim()) {
      this.errorMessage = 'Please enter your Phone Number, Email, or Order ID.';
      this.cdr.detectChanges();
      return;
    }
    const id = this.guestIdentifier.trim();
    this.closeModal();
    this.router.navigate(['/orders'], { queryParams: { track: id } });
  }

  onGuestSetPasswordSubmit() {
    this.errorMessage = '';
    if (!this.guestIdentifier.trim()) {
      this.errorMessage = 'Please enter your Phone Number or Email.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.guestNewPassword || this.guestNewPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      this.cdr.detectChanges();
      return;
    }
    if (this.guestNewPassword !== this.guestConfirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.authService.guestSetPassword(this.guestIdentifier.trim(), this.guestNewPassword).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          if (res.success) {
            this.closeModal();
            this.router.navigate(['/orders']);
          }
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Failed to set password. Please check your details.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  onSubmit() {
    this.errorMessage = '';

    if (this.authMode === 'login') {
      if (!this.formData.email || !this.formData.password) {
        this.errorMessage = 'Please fill in all fields';
        this.cdr.detectChanges();
        return;
      }

      this.isLoading = true;
      this.cdr.detectChanges();

      this.authService.login({ email: this.formData.email, password: this.formData.password }).subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            this.isLoading = false;
            if (res.success) {
              this.closeModal();
            }
            this.cdr.detectChanges();
          });
        },
        error: (err: any) => {
          this.ngZone.run(() => {
            this.isLoading = false;
            if (err.guestNeedsPassword) {
              this.guestIdentifier = err.email || err.phone || this.formData.email;
              this.authMode = 'guest-set-password';
              this.guestMessage = `Guest account found for ${this.guestIdentifier}! You haven't set a password yet. Create your password below to log in, or track your live order directly.`;
              this.cdr.detectChanges();
              return;
            }
            this.errorMessage = err.message || 'Login failed. Please check your credentials.';
            this.cdr.detectChanges();
          });
        }
      });
    } else if (this.authMode === 'register') {
      if (!this.formData.name || !this.formData.email || !this.formData.password) {
        this.errorMessage = 'Please fill in all required fields';
        this.cdr.detectChanges();
        return;
      }

      if (this.formData.password !== this.formData.confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        this.cdr.detectChanges();
        return;
      }

      this.isLoading = true;
      this.cdr.detectChanges();

      this.authService.register({
        name: this.formData.name,
        email: this.formData.email,
        password: this.formData.password,
        phone: this.formData.phone
      }).subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res.success) {
              this.authService.login({ email: this.formData.email, password: this.formData.password }).subscribe({
                next: () => {
                  this.ngZone.run(() => {
                    this.isLoading = false;
                    this.closeModal();
                    this.cdr.detectChanges();
                  });
                },
                error: () => {
                  this.ngZone.run(() => {
                    this.isLoading = false;
                    this.switchToMode('login');
                    this.cdr.detectChanges();
                  });
                }
              });
            } else {
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.errorMessage = err.message || 'Registration failed. Please try again.';
            this.cdr.detectChanges();
          });
        }
      });
    }
  }
}

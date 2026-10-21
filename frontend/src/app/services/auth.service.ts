import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Address {
  id?: string;
  label: string;
  fullAddress: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  needsPasswordSet?: boolean;
  isGuestConverted?: boolean;
  addresses?: Address[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  accessToken?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'foodybhai_token';
  private readonly USER_KEY = 'foodybhai_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);

    if (token && userJson) {
      try {
        const user: User = JSON.parse(userJson);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch {
        this.clearAuth();
      }
    }
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/register`, data)
      .pipe(
        catchError((error) => {
          let message = error.error?.message || 'Registration failed. Please try again.';
          if (Array.isArray(message)) {
            message = message.join(' | ');
          }
          return throwError(() => new Error(message));
        }),
      );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/login`, data)
      .pipe(
        tap((response) => {
          if (response.success && response.accessToken) {
            this.setAuth(response.accessToken, response.user);
          }
        }),
        catchError((error) => {
          if (error.error?.guestNeedsPassword) {
            const errObj = new Error(error.error.message || 'Guest account needs password');
            (errObj as any).guestNeedsPassword = true;
            (errObj as any).email = error.error.email;
            (errObj as any).phone = error.error.phone;
            (errObj as any).name = error.error.name;
            return throwError(() => errObj);
          }
          let message = error.error?.message || 'Login failed. Please try again.';
          if (Array.isArray(message)) {
            message = message.join(' | ');
          }
          return throwError(() => new Error(message));
        }),
      );
  }

  guestSetPassword(identifier: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/guest-set-password`, { identifier, password })
      .pipe(
        tap((response) => {
          if (response.success && response.accessToken) {
            this.setAuth(response.accessToken, response.user);
          }
        }),
        catchError((error) => {
          let message = error.error?.message || 'Failed to set password. Please try again.';
          if (Array.isArray(message)) {
            message = message.join(' | ');
          }
          return throwError(() => new Error(message));
        })
      );
  }

  sendForgotPasswordOtp(identifier: string): Observable<{ success: boolean; message: string; maskedEmail?: string; maskedPhone?: string }> {
    return this.http.post<{ success: boolean; message: string; maskedEmail?: string; maskedPhone?: string }>(
      `${this.API_URL}/auth/forgot-password/send-otp`,
      { identifier }
    ).pipe(
      catchError((error) => {
        let message = error.error?.message || 'Failed to send verification OTP. Please try again.';
        if (Array.isArray(message)) message = message.join(' | ');
        return throwError(() => new Error(message));
      })
    );
  }

  verifyForgotPasswordOtp(identifier: string, otp: string): Observable<{ success: boolean; message: string; resetToken: string }> {
    return this.http.post<{ success: boolean; message: string; resetToken: string }>(
      `${this.API_URL}/auth/forgot-password/verify-otp`,
      { identifier, otp }
    ).pipe(
      catchError((error) => {
        let message = error.error?.message || 'Invalid or expired OTP code. Please check and try again.';
        if (Array.isArray(message)) message = message.join(' | ');
        return throwError(() => new Error(message));
      })
    );
  }

  resetPasswordWithToken(identifier: string, resetToken: string, newPassword: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.API_URL}/auth/forgot-password/reset`,
      { identifier, resetToken, newPassword }
    ).pipe(
      tap((response) => {
        if (response.success && response.accessToken) {
          this.setAuth(response.accessToken, response.user);
        }
      }),
      catchError((error) => {
        let message = error.error?.message || 'Failed to update password. Please try again.';
        if (Array.isArray(message)) message = message.join(' | ');
        return throwError(() => new Error(message));
      })
    );
  }

  logout(): void {
    this.clearAuth();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public setAuth(token: string, user: User): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  public setPassword(password: string): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/users/me/set-password`, { password }).pipe(
      tap((updatedUser) => {
        const current = this.getCurrentUser();
        const merged: User = {
          ...(current || ({} as User)),
          ...(updatedUser || {}),
          needsPasswordSet: false,
        };
        this.currentUserSubject.next(merged);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(merged));
        }
      })
    );
  }

  private clearAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  // --- Profile & Address Methods ---

  fetchProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/me`).pipe(
      tap(user => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
      })
    );
  }

  addAddress(address: { label: string, fullAddress: string }): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users/addresses`, address).pipe(
      tap(user => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
      })
    );
  }

  deleteAddress(addressId: string): Observable<User> {
    return this.http.delete<User>(`${this.API_URL}/users/addresses/${addressId}`).pipe(
      tap(user => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
      })
    );
  }
}

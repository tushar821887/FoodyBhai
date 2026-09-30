import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
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
          let message = error.error?.message || 'Login failed. Please try again.';
          if (Array.isArray(message)) {
            message = message.join(' | ');
          }
          return throwError(() => new Error(message));
        }),
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

  private setAuth(token: string, user: User): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }
}

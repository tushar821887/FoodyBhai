import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { WebsiteTheme, THEME_PRESETS } from '../models/theme.model';

const STORAGE_KEY = 'foodybhai_active_theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly defaultTheme: WebsiteTheme = THEME_PRESETS.find(p => p.id === 'bollywood-sunset') || THEME_PRESETS[0];

  private getInitialTheme(): WebsiteTheme {
    const fallback = THEME_PRESETS.find(p => p.id === 'bollywood-sunset') || THEME_PRESETS[0];
    try {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object' && parsed.primaryColor) {
            return parsed;
          }
        }
      }
    } catch (e) {}
    return fallback;
  }

  private currentThemeSubject = new BehaviorSubject<WebsiteTheme>(this.getInitialTheme());
  public currentTheme$: Observable<WebsiteTheme> = this.currentThemeSubject.asObservable();

  private isBrowser: boolean;
  private readonly API_URL = `${environment.apiUrl}/settings/website_theme`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.initializeTheme();
  }

  private initializeTheme() {
    if (!this.isBrowser) return;

    // 1. Immediately apply cached/active theme to avoid flash of unstyled theme
    const active = this.getInitialTheme();
    this.applyThemeToDOM(active);
    this.currentThemeSubject.next(active);

    // 2. Fetch latest live theme from backend API
    this.fetchLiveTheme(true).subscribe();

    // 3. Listen for live updates from Admin across browser tabs
    try {
      if ('BroadcastChannel' in window) {
        const ch = new BroadcastChannel('foodybhai_theme_channel');
        ch.onmessage = (ev) => {
          if (ev.data?.type === 'THEME_UPDATED') {
            if (ev.data.theme) {
              this.applyThemeToDOM(ev.data.theme);
              this.currentThemeSubject.next(ev.data.theme);
              if (this.isBrowser) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(ev.data.theme));
              }
            } else {
              this.fetchLiveTheme(true).subscribe();
            }
          }
        };
      }
      window.addEventListener('storage', (ev) => {
        if (ev.key === 'foodybhai_theme_last_published' || ev.key === STORAGE_KEY) {
          this.fetchLiveTheme(true).subscribe();
        }
      });
    } catch (e) {
      console.warn('Theme storage listener failed', e);
    }
  }

  fetchLiveTheme(forceRefresh = true): Observable<any> {
    const url = `${this.API_URL}?t=${Date.now()}`;
    return this.http.get<any>(url).pipe(
      tap(res => {
        const theme = res && res.value ? res.value : this.defaultTheme;
        if (theme && typeof theme === 'object') {
          this.applyThemeToDOM(theme);
          this.currentThemeSubject.next(theme);
          if (this.isBrowser) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
          }
        }
      }),
      catchError(err => {
        console.warn('Could not fetch remote theme, using cached or default', err);
        return of(null);
      })
    );
  }

  getCurrentTheme(): WebsiteTheme {
    return this.currentThemeSubject.value;
  }

  applyThemeToDOM(theme: WebsiteTheme) {
    if (!this.isBrowser || !theme) return;

    const root = document.documentElement;

    // Core Brand Colors
    if (theme.primaryColor) {
      root.style.setProperty('--primary-color', theme.primaryColor);
      root.style.setProperty('--shadow-hover', `0 10px 25px ${this.hexToRgba(theme.primaryColor, 0.22)}`);
    }
    if (theme.primaryHover) {
      root.style.setProperty('--primary-hover', theme.primaryHover);
    }
    if (theme.primaryDark) {
      root.style.setProperty('--primary-dark', theme.primaryDark);
    }
    if (theme.primaryLight) {
      root.style.setProperty('--primary-light', theme.primaryLight);
    } else if (theme.primaryColor) {
      root.style.setProperty('--primary-light', this.hexToRgba(theme.primaryColor, 0.08));
    }
    if (theme.primaryBorder) {
      root.style.setProperty('--primary-border', theme.primaryBorder);
    } else if (theme.primaryColor) {
      root.style.setProperty('--primary-border', this.hexToRgba(theme.primaryColor, 0.22));
    }
    if (theme.primaryGlow) {
      root.style.setProperty('--primary-glow', theme.primaryGlow);
    } else if (theme.primaryColor) {
      root.style.setProperty('--primary-glow', this.hexToRgba(theme.primaryColor, 0.28));
    }

    // Secondary & Contrast Colors
    if (theme.secondaryColor) {
      root.style.setProperty('--secondary-color', theme.secondaryColor);
    }
    if (theme.secondaryLight) {
      root.style.setProperty('--secondary-light', theme.secondaryLight);
    }

    // Surfaces & Typography
    if (theme.backgroundLight) {
      root.style.setProperty('--background-light', theme.backgroundLight);
    }
    if (theme.backgroundWhite) {
      root.style.setProperty('--background-white', theme.backgroundWhite);
    }
    if (theme.textDark) {
      root.style.setProperty('--text-dark', theme.textDark);
    }
    if (theme.textLight) {
      root.style.setProperty('--text-light', theme.textLight);
    }

    // Primary Gradient for CTA buttons, badges, highlights
    const angle = theme.gradientAngle || '135deg';
    const gradStart = theme.gradientStart || theme.primaryColor;
    const gradEnd = theme.gradientEnd || theme.primaryHover;
    const gradient = `linear-gradient(${angle}, ${gradStart} 0%, ${gradEnd} 100%)`;
    root.style.setProperty('--primary-gradient', gradient);

    // Marquee Header Gradient
    const marqStart = theme.marqueeStart || gradEnd;
    const marqEnd = theme.marqueeEnd || gradStart;
    const marqueeGradient = `linear-gradient(90deg, ${marqStart} 0%, ${marqEnd} 50%, ${marqStart} 100%)`;
    root.style.setProperty('--marquee-gradient', marqueeGradient);

    // Also inject/update dynamic style tag to guarantee overrides with highest specificity
    try {
      let styleTag = document.getElementById('dynamic-theme-style') as HTMLStyleElement;
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'dynamic-theme-style';
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = `
        :root {
          --primary-color: ${theme.primaryColor} !important;
          --primary-hover: ${theme.primaryHover || theme.primaryColor} !important;
          --primary-dark: ${theme.primaryDark || theme.primaryColor} !important;
          --primary-light: ${theme.primaryLight || this.hexToRgba(theme.primaryColor, 0.08)} !important;
          --primary-border: ${theme.primaryBorder || this.hexToRgba(theme.primaryColor, 0.22)} !important;
          --primary-glow: ${theme.primaryGlow || this.hexToRgba(theme.primaryColor, 0.28)} !important;
          --secondary-color: ${theme.secondaryColor || '#241814'} !important;
          --secondary-light: ${theme.secondaryLight || '#3d2c25'} !important;
          --primary-gradient: ${gradient} !important;
          --marquee-gradient: ${marqueeGradient} !important;
        }
      `;
    } catch (e) {
      console.warn('Failed to inject dynamic theme style tag', e);
    }
  }

  saveTheme(theme: WebsiteTheme): Observable<any> {
    // 1. Immediately apply locally
    this.applyThemeToDOM(theme);
    this.currentThemeSubject.next(theme);
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    }

    // 2. Persist to server settings
    return this.http.put<any>(this.API_URL, { value: theme });
  }

  private hexToRgba(hex: string, alpha: number): string {
    if (!hex) return `rgba(249, 95, 0, ${alpha})`;
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    if (isNaN(num)) return `rgba(249, 95, 0, ${alpha})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

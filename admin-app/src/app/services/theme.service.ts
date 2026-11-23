import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { WebsiteTheme, THEME_PRESETS } from '../models/theme.model';

const STORAGE_KEY = 'foodybhai_active_theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly defaultTheme: WebsiteTheme = THEME_PRESETS[0];
  private currentThemeSubject = new BehaviorSubject<WebsiteTheme>(this.defaultTheme);
  public currentTheme$: Observable<WebsiteTheme> = this.currentThemeSubject.asObservable();

  private api = inject(ApiService);

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme() {
    if (typeof window === 'undefined') return;

    // 1. Immediately apply cached theme from localStorage
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        this.applyThemeToDOM(parsed);
        this.currentThemeSubject.next(parsed);
      } catch (e) {
        this.applyThemeToDOM(this.defaultTheme);
      }
    } else {
      this.applyThemeToDOM(this.defaultTheme);
    }

    // 2. Fetch live theme from backend
    this.fetchLiveTheme().subscribe();
  }

  fetchLiveTheme(): Observable<any> {
    return this.api.getSetting('website_theme').pipe(
      tap(res => {
        const theme = res && res.value ? res.value : this.defaultTheme;
        if (theme && typeof theme === 'object') {
          this.applyThemeToDOM(theme);
          this.currentThemeSubject.next(theme);
          if (typeof window !== 'undefined') {
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
    if (typeof document === 'undefined' || !theme) return;

    const root = document.documentElement;

    if (theme.primaryColor) {
      root.style.setProperty('--primary-color', theme.primaryColor);
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
    if (theme.primaryColor) {
      root.style.setProperty('--shadow-hover', `0 10px 25px ${this.hexToRgba(theme.primaryColor, 0.22)}`);
    }
    if (theme.secondaryColor) {
      root.style.setProperty('--secondary-color', theme.secondaryColor);
    }
    if (theme.backgroundLight) {
      root.style.setProperty('--background-light', theme.backgroundLight);
    }
    if (theme.textDark) {
      root.style.setProperty('--text-dark', theme.textDark);
    }

    const angle = theme.gradientAngle || '135deg';
    const gStart = theme.gradientStart || theme.primaryColor;
    const gEnd = theme.gradientEnd || theme.primaryHover || theme.primaryColor;
    root.style.setProperty('--primary-gradient', `linear-gradient(${angle}, ${gStart} 0%, ${gEnd} 100%)`);

    const mStart = theme.marqueeStart || theme.primaryHover || theme.primaryColor;
    const mEnd = theme.marqueeEnd || theme.primaryColor;
    root.style.setProperty('--marquee-gradient', `linear-gradient(90deg, ${mStart} 0%, ${mEnd} 50%, ${mStart} 100%)`);
  }

  private hexToRgba(hex: string, alpha: number): string {
    if (!hex) return `rgba(249, 95, 0, ${alpha})`;
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
    const num = parseInt(cleanHex, 16);
    if (isNaN(num)) return `rgba(249, 95, 0, ${alpha})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  saveTheme(theme: WebsiteTheme): Observable<any> {
    return this.api.saveSetting('website_theme', theme).pipe(
      tap(() => {
        this.applyThemeToDOM(theme);
        this.currentThemeSubject.next(theme);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
          localStorage.setItem('foodybhai_theme_last_published', Date.now().toString());
          try {
            if ('BroadcastChannel' in window) {
              const ch = new BroadcastChannel('foodybhai_theme_channel');
              ch.postMessage({ type: 'THEME_UPDATED', theme, timestamp: Date.now() });
              setTimeout(() => ch.close(), 100);
            }
          } catch (e) {
            console.warn('Theme broadcast failed', e);
          }
        }
      })
    );
  }
}

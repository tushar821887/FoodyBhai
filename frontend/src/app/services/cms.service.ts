import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { CmsPage } from '../models/cms.model';

const STORAGE_KEY = 'foodybhai_cms_pages';

/**
 * CMS pages are fetched directly from MongoDB database via /api/pages.
 * No hardcoded mock pages or dummy reviews are used.
 */
export const DEFAULT_WEBSITE_PAGES: CmsPage[] = [];

@Injectable({
  providedIn: 'root'
})
export class CmsService {
  private isBrowser: boolean;

  private getInitialPages(): CmsPage[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached pages', e);
    }
    return [];
  }

  private pagesSubject = new BehaviorSubject<CmsPage[]>(this.getInitialPages());
  public pages$: Observable<CmsPage[]> = this.pagesSubject.asObservable();

  private isPagesLoadingSubject = new BehaviorSubject<boolean>(true);
  public isPagesLoading$: Observable<boolean> = this.isPagesLoadingSubject.asObservable();

  private isBackendOfflineSubject = new BehaviorSubject<boolean>(false);
  public isBackendOffline$: Observable<boolean> = this.isBackendOfflineSubject.asObservable();

  private readonly PAGES_API_URL = `${environment.apiUrl}/pages`;
  private readonly SETTINGS_API_URL = `${environment.apiUrl}/settings/website_pages`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.initializePages();
  }

  private initializePages() {
    if (!this.isBrowser) return;

    // Fetch live pages strictly from backend database API
    this.fetchLivePages(true).subscribe();

    // Listen for live updates from Admin App across tabs
    try {
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('foodybhai_cms_channel');
        channel.onmessage = (ev) => {
          if (ev.data?.type === 'PAGES_UPDATED') {
            this.fetchLivePages(true).subscribe();
          }
        };
      }
      window.addEventListener('storage', (ev) => {
        if (ev.key === 'foodybhai_cms_last_published' || ev.key === STORAGE_KEY) {
          this.fetchLivePages(true).subscribe();
        }
      });
    } catch (e) {
      console.warn('Failed to register CMS storage listener', e);
    }
  }

  fetchLivePages(forceRefresh = true): Observable<CmsPage[]> {
    const url = `${this.PAGES_API_URL}?t=${Date.now()}`;
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    return this.http.get<any>(url, { headers }).pipe(
      map(res => {
        let pages: any[] = [];
        if (Array.isArray(res)) {
          pages = res;
        } else if (res && Array.isArray(res.value)) {
          pages = res.value;
        } else if (res && Array.isArray(res.pages)) {
          pages = res.pages;
        }
        return pages as CmsPage[];
      }),
      tap(pages => {
        this.isBackendOfflineSubject.next(false);
        if (pages && pages.length > 0) {
          const fresh = JSON.parse(JSON.stringify(pages));
          this.pagesSubject.next(fresh);
          if (this.isBrowser) {
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
            } catch (e) {}
          }
        } else {
          // If live fetch returned empty, keep cached pages if available, or clear
          if (this.pagesSubject.value.length === 0) {
            this.pagesSubject.next([]);
          }
        }
        this.isPagesLoadingSubject.next(false);
      }),
      catchError(err => {
        console.warn('Could not fetch /pages from database, falling back to settings', err);
        const fallbackUrl = `${this.SETTINGS_API_URL}?t=${Date.now()}`;
        return this.http.get<any>(fallbackUrl, { headers }).pipe(
          map(res => (res && res.value && Array.isArray(res.value) ? res.value : []) as CmsPage[]),
          tap(pages => {
            this.isBackendOfflineSubject.next(false);
            if (pages && pages.length > 0) {
              const fresh = JSON.parse(JSON.stringify(pages));
              this.pagesSubject.next(fresh);
              if (this.isBrowser) {
                try {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
                } catch (e) {}
              }
            }
            this.isPagesLoadingSubject.next(false);
          }),
          catchError(() => {
            if (this.pagesSubject.value.length === 0) {
              this.isBackendOfflineSubject.next(true);
              this.pagesSubject.next([]);
            }
            this.isPagesLoadingSubject.next(false);
            return of(this.pagesSubject.value);
          })
        );
      })
    );
  }

  getAllPages(): CmsPage[] {
    return this.pagesSubject.value;
  }

  getPageBySlug(slug: string): Observable<CmsPage | null> {
    const cleanSlug = (slug || '').toLowerCase().trim().replace(/^\//, '').replace(/\/$/, '');
    return this.pages$.pipe(
      map(pages => {
        const found = pages.find(p => {
          const s = (p.slug || '').toLowerCase().trim().replace(/^\//, '').replace(/\/$/, '');
          return s === cleanSlug && p.isEnabled !== false;
        });
        return found || null;
      })
    );
  }

  saveAllPages(pages: CmsPage[]): Observable<any> {
    const token = this.isBrowser ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return this.http.put<any>(`${this.PAGES_API_URL}/bulk`, pages, { headers }).pipe(
      tap(() => {
        this.pagesSubject.next(pages);
        if (this.isBrowser) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
            localStorage.setItem('foodybhai_cms_last_published', Date.now().toString());
          } catch (e) {}
        }
      })
    );
  }
}

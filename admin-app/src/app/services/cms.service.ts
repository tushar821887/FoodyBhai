import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { CmsPage } from '../models/cms.model';

const STORAGE_KEY = 'foodybhai_cms_pages';

/**
 * CMS pages are loaded directly from the database API.
 * No hardcoded mock pages or dummy reviews are used.
 */
export const DEFAULT_WEBSITE_PAGES: CmsPage[] = [];

@Injectable({
  providedIn: 'root'
})
export class CmsService {
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

  private api = inject(ApiService);

  constructor() {
    this.initializePages();
  }

  private initializePages() {
    if (typeof window === 'undefined') return;

    // 1. Read cached
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.pagesSubject.next(parsed);
        }
      } catch (e) {
        console.warn('Failed to parse cached pages', e);
      }
    }

    // 2. Fetch live
    this.fetchLivePages().subscribe();
  }

  fetchLivePages(): Observable<CmsPage[]> {
    return this.api.getPages().pipe(
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
        if (pages && pages.length > 0) {
          this.pagesSubject.next(pages);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
          }
        }
      }),
      catchError(err => {
        console.warn('Could not fetch database pages, trying settings fallback...', err);
        return this.api.getSetting('website_pages').pipe(
          map(res => (res && res.value && Array.isArray(res.value) ? res.value : []) as CmsPage[]),
          tap(pages => {
            if (pages && pages.length > 0) {
              this.pagesSubject.next(pages);
            }
          }),
          catchError(() => of(this.pagesSubject.value))
        );
      })
    );
  }

  getAllPages(): CmsPage[] {
    return this.pagesSubject.value;
  }

  getPageBySlug(slug: string): Observable<CmsPage | null> {
    const cleanSlug = (slug || '').toLowerCase().trim().replace(/^\//, '');
    return this.pages$.pipe(
      map(pages => {
        const found = pages.find(p => {
          const s = (p.slug || '').toLowerCase().trim().replace(/^\//, '');
          return s === cleanSlug;
        });
        return found || null;
      })
    );
  }

  saveAllPages(pages: CmsPage[]): Observable<any> {
    return this.api.savePages(pages).pipe(
      tap(() => {
        this.pagesSubject.next(pages);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
        }
        this.notifyWebsiteSync();
        // Also save to settings for backward compatibility
        this.api.saveSetting('website_pages', pages).subscribe({ error: () => {} });
      }),
      catchError(err => {
        console.warn('PUT /pages/bulk failed (status: ' + err?.status + '), falling back to PUT /settings/website_pages...', err);
        return this.api.saveSetting('website_pages', pages).pipe(
          tap(() => {
            this.pagesSubject.next(pages);
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
            }
            this.notifyWebsiteSync();
          })
        );
      })
    );
  }

  deletePageBySlug(slug: string): Observable<any> {
    return this.api.deletePage(slug).pipe(
      tap(() => {
        const updated = this.pagesSubject.value.filter(p => p.slug !== slug);
        this.pagesSubject.next(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
        this.notifyWebsiteSync();
      })
    );
  }

  private notifyWebsiteSync() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('foodybhai_cms_last_published', Date.now().toString());
        if ('BroadcastChannel' in window) {
          const channel = new BroadcastChannel('foodybhai_cms_channel');
          channel.postMessage({ type: 'PAGES_UPDATED', timestamp: Date.now() });
          setTimeout(() => channel.close(), 100);
        }
      } catch (e) {
        console.warn('Broadcast sync notice failed', e);
      }
    }
  }
}

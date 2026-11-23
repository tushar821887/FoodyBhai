import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

export interface AppVersionInfo {
  version: string;
  downloadUrl: string;
  releaseNotes: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppUpdateService {
  private apiUrl = environment.apiUrl;

  // Environment
  public isNative = false;
  public isAndroid = false;

  // Versions & URLs
  public currentVersion = '1.0.0';
  public latestVersion = '1.0.0';
  public downloadUrl = '/downloads/foodybhai.apk';
  public releaseNotes = 'Real-time order alerts, smoother performance, and instant live order tracking.';
  public hasUpdate = false;
  public isInstalledOnDevice = false;

  // Feedback & UI
  public updateSuccessMessage = '';
  public showModal = false;
  public isDismissed = false;

  private updateStatusSubject = new BehaviorSubject<{
    hasUpdate: boolean;
    currentVersion: string;
    latestVersion: string;
    downloadUrl: string;
    releaseNotes: string;
    isInstalled: boolean;
    isNative: boolean;
  }>({
    hasUpdate: false,
    currentVersion: '1.0.0',
    latestVersion: '1.0.0',
    downloadUrl: '/downloads/foodybhai.apk',
    releaseNotes: '',
    isInstalled: false,
    isNative: false
  });

  public updateStatus$ = this.updateStatusSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.isNative = Capacitor.isNativePlatform();
      this.isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
      this.init();
    }
  }

  private async init() {
    // 1. Determine current installed version
    if (this.isNative) {
      try {
        const info = await CapacitorApp.getInfo();
        this.currentVersion = info.version || '1.0.0';
        this.isInstalledOnDevice = true;

        // Check if app was updated recently
        const lastVersion = localStorage.getItem('foodybhai_last_installed_version');
        if (lastVersion && this.compareVersions(this.currentVersion, lastVersion) > 0) {
          this.updateSuccessMessage = `🎉 FoodyBhai updated successfully to v${this.currentVersion}!`;
          setTimeout(() => {
            this.updateSuccessMessage = '';
          }, 8000);
        }
        localStorage.setItem('foodybhai_last_installed_version', this.currentVersion);
      } catch (e) {
        this.currentVersion = '1.0.0';
      }
    } else {
      // Running on web browser
      const recordedVersion = localStorage.getItem('foodybhai_apk_installed_version');
      if (recordedVersion) {
        this.currentVersion = recordedVersion;
        this.isInstalledOnDevice = true;
      }
      this.isDismissed = sessionStorage.getItem('foodybhai_app_banner_dismissed') === 'true';
    }

    // 2. Query backend for the latest version
    this.checkForUpdates();
  }

  public checkForUpdates(): void {
    this.http.get<any>(`${this.apiUrl}/settings/app/latest`).subscribe({
      next: (res) => {
        if (res) {
          this.latestVersion = res.version || '1.0.0';
          this.downloadUrl = res.downloadUrl || '/downloads/foodybhai.apk';
          if (res.releaseNotes) {
            this.releaseNotes = res.releaseNotes;
          }

          this.evaluateUpdateStatus();
        }
      },
      error: () => {
        // Fallback: direct setting check
        this.http.get<any>(`${this.apiUrl}/settings/app_version`).subscribe({
          next: (verRes) => {
            if (verRes && verRes.value) {
              this.latestVersion = verRes.value;
              this.evaluateUpdateStatus();
            }
          }
        });
      }
    });
  }

  private evaluateUpdateStatus(): void {
    this.hasUpdate = this.compareVersions(this.latestVersion, this.currentVersion) > 0;

    // If native app and has update, show update modal automatically
    if (this.isNative && this.hasUpdate) {
      this.showModal = true;
    }

    this.updateStatusSubject.next({
      hasUpdate: this.hasUpdate,
      currentVersion: this.currentVersion,
      latestVersion: this.latestVersion,
      downloadUrl: this.downloadUrl,
      releaseNotes: this.releaseNotes,
      isInstalled: this.isInstalledOnDevice || this.isNative,
      isNative: this.isNative
    });
  }

  public compareVersions(v1: string, v2: string): number {
    const p1 = (v1 || '0').split('.').map(n => parseInt(n, 10) || 0);
    const p2 = (v2 || '0').split('.').map(n => parseInt(n, 10) || 0);
    const maxLen = Math.max(p1.length, p2.length);
    for (let i = 0; i < maxLen; i++) {
      const num1 = p1[i] || 0;
      const num2 = p2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  }

  /**
   * Downloads or updates the APK directly
   */
  public async downloadOrUpdateApk(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Check if relative path or same-origin URL
    const isLocalUrl = this.downloadUrl.startsWith('/') || this.downloadUrl.startsWith(window.location.origin);
    
    if (isLocalUrl) {
      try {
        const response = await fetch(this.downloadUrl, { method: 'HEAD' });
        const contentType = response.headers.get('content-type') || '';
        // If server returned 404 or an HTML fallback page, the APK is missing
        if (!response.ok || contentType.includes('text/html')) {
          this.updateSuccessMessage = '⚠️ APK file is not yet placed in /downloads/foodybhai.apk! Please copy your FoodyBhai.apk into frontend/public/downloads/ or configure a valid link in Admin Settings.';
          setTimeout(() => {
            this.updateSuccessMessage = '';
          }, 9000);
          return;
        }
      } catch (e) {
        // If HEAD request fails due to server configuration, continue to download
      }
    }

    // Mark that user downloaded/installed this version
    localStorage.setItem('foodybhai_apk_installed_version', this.latestVersion);
    localStorage.setItem('foodybhai_apk_downloaded', 'true');
    this.isInstalledOnDevice = true;

    // Direct download trigger
    const link = document.createElement('a');
    link.href = this.downloadUrl;
    link.setAttribute('download', 'FoodyBhai.apk');
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Provide user feedback & installation guide
    if (this.hasUpdate) {
      this.updateSuccessMessage = `⬇️ Downloading update (v${this.latestVersion})... Tap the downloaded file in your notification bar to install!`;
    } else {
      this.updateSuccessMessage = '⬇️ Downloading FoodyBhai APK... Tap the downloaded file in your notification bar to install!';
    }

    this.hasUpdate = false;
    this.currentVersion = this.latestVersion;
    this.showModal = false;

    this.updateStatusSubject.next({
      hasUpdate: false,
      currentVersion: this.latestVersion,
      latestVersion: this.latestVersion,
      downloadUrl: this.downloadUrl,
      releaseNotes: this.releaseNotes,
      isInstalled: true,
      isNative: this.isNative
    });

    setTimeout(() => {
      this.updateSuccessMessage = '';
    }, 9000);
  }

  /**
   * Attempts to launch the installed FoodyBhai app on Android
   */
  public openApp(): void {
    if (typeof window === 'undefined') return;
    const fallback = encodeURIComponent(window.location.origin + this.downloadUrl);
    const intentUrl = `intent://foodybhai.in/#Intent;scheme=https;package=com.foodybhai.app;S.browser_fallback_url=${fallback};end`;
    window.location.href = intentUrl;
  }

  public dismissBanner(): void {
    this.isDismissed = true;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('foodybhai_app_banner_dismissed', 'true');
    }
  }

  public openModal(): void {
    this.showModal = true;
  }

  public closeModal(): void {
    this.showModal = false;
  }
}

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly LOCATION_KEY = 'foodybhai_location';
  private locationSubject = new BehaviorSubject<string | null>(null);
  public location$ = this.locationSubject.asObservable();

  private showModalSubject = new BehaviorSubject<boolean>(false);
  public showModal$ = this.showModalSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.LOCATION_KEY);
      if (saved) {
        this.locationSubject.next(saved);
      } else {
        // If no location is saved, show the modal
        setTimeout(() => this.openLocationModal(), 1000);
      }
    }
  }

  saveLocation(location: string) {
    this.locationSubject.next(location);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.LOCATION_KEY, location);
    }
  }

  getLocation(): string | null {
    return this.locationSubject.value;
  }

  openLocationModal() {
    this.showModalSubject.next(true);
  }

  closeLocationModal() {
    this.showModalSubject.next(false);
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private authModalOpenSubject = new BehaviorSubject<boolean>(false);
  public authModalOpen$ = this.authModalOpenSubject.asObservable();

  openAuthModal() {
    this.authModalOpenSubject.next(true);
  }

  closeAuthModal() {
    this.authModalOpenSubject.next(false);
  }
}

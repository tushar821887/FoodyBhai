import { Component, signal, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { isPlatformBrowser, Location } from '@angular/common';
import { App as CapacitorApp } from '@capacitor/app';
import { Dialog } from '@capacitor/dialog';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { LocationModalComponent } from './components/location-modal/location-modal';
import { OrderService } from './services/order.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Header, Footer, LocationModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('Foody Bhai');
  restaurantOpen = true;
  restaurantClosedReason = '';

  constructor(
    private router: Router,
    private location: Location,
    private orderService: OrderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.setupBackButton();
      this.orderService.getSetting('restaurant_open').subscribe(res => {
        if (res && res.value !== undefined) this.restaurantOpen = res.value === 'true' || res.value === true;
      });
      this.orderService.getSetting('restaurant_closed_reason').subscribe(res => {
        if (res && res.value) this.restaurantClosedReason = res.value;
      });
    }
  }

  setupBackButton() {
    CapacitorApp.addListener('backButton', async ({ canGoBack }) => {
      if (this.router.url === '/' || this.router.url === '/home' || this.router.url === '/login' || !canGoBack) {
        // App is on the home page, login page, or can't go back further
        const { value } = await Dialog.confirm({
          title: 'Confirm',
          message: 'Are you sure you want to exit Foody Bhai?',
          okButtonTitle: 'Exit',
          cancelButtonTitle: 'Cancel'
        });
        
        if (value) {
          CapacitorApp.exitApp();
        }
      } else {
        // Not on home page, go back in history
        this.location.back();
      }
    });
  }
}

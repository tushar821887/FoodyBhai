import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map, startWith, combineLatest } from 'rxjs';
import { AppUpdateService } from '../../services/app-update.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-download-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-download-banner.html',
  styleUrl: './app-download-banner.css'
})
export class AppDownloadBannerComponent {
  public appUpdate = inject(AppUpdateService);
  public cartService = inject(CartService);
  private router = inject(Router);

  public isCartRoute$ = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    map(event => {
      const clean = (event.urlAfterRedirects || event.url).split('?')[0].split('#')[0];
      return clean === '/cart' || clean.startsWith('/cart/') || clean === '/admin' || clean.startsWith('/admin/');
    }),
    startWith(
      (() => {
        const clean = (this.router.url || '').split('?')[0].split('#')[0];
        return clean === '/cart' || clean.startsWith('/cart/') || clean === '/admin' || clean.startsWith('/admin/');
      })()
    )
  );

  public hasFloatingCart$ = combineLatest([
    this.cartService.totalQuantity$,
    this.isCartRoute$
  ]).pipe(
    map(([qty, isCart]) => (qty > 0) && !isCart)
  );
}

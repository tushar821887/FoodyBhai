import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AppUpdateService } from '../../services/app-update.service';
import { BehaviorSubject, combineLatest, filter, map, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-floating-cart-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe],
  templateUrl: './floating-cart-bar.html',
  styleUrl: './floating-cart-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FloatingCartBarComponent implements OnInit, OnDestroy {
  public cartService = inject(CartService);
  private router = inject(Router);
  public appUpdate = inject(AppUpdateService);

  private currentUrlSubject = new BehaviorSubject<string>(this.router.url || '');
  public currentUrl$ = this.currentUrlSubject.asObservable();

  public totalQuantity$ = this.cartService.totalQuantity$;
  public totalPrice$ = this.cartService.totalPrice$;

  // Only show when items exist and user is NOT on cart or admin route
  public isVisible$: Observable<boolean> = combineLatest([
    this.totalQuantity$,
    this.currentUrl$
  ]).pipe(
    map(([quantity, url]) => {
      if (!quantity || quantity <= 0) return false;
      const cleanUrl = (url || '').split('?')[0].split('#')[0];
      const isCart = cleanUrl === '/cart' || cleanUrl.startsWith('/cart/');
      const isAdmin = cleanUrl === '/admin' || cleanUrl.startsWith('/admin/');
      return !isCart && !isAdmin;
    })
  );

  private routerSub?: Subscription;

  ngOnInit() {
    this.currentUrlSubject.next(this.router.url);

    this.routerSub = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrlSubject.next(event.urlAfterRedirects || event.url);
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  goToCart(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.router.navigate(['/cart']);
  }
}

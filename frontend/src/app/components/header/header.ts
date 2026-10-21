import { Component, HostListener, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { LocationService } from '../../services/location.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { AuthModalComponent } from '../auth-modal/auth-modal';
import { AppUpdateService } from '../../services/app-update.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, AuthModalComponent],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  isScrolled = false;
  isMenuOpen = false;
  isAuthModalOpen = false;
  isAccountDropdownOpen = false;

  constructor(
    public cartService: CartService, 
    public locationService: LocationService,
    public authService: AuthService,
    public uiService: UiService,
    public appUpdateService: AppUpdateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.uiService.authModalOpen$.subscribe(isOpen => {
      this.ngZone.run(() => {
        this.isAuthModalOpen = isOpen;
        this.cdr.detectChanges();
      });
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeAccountDropdown();
      this.closeMenu();
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (
      !target.closest('.account-dropdown-wrapper') &&
      !target.closest('.account-nav-wrapper') &&
      !target.closest('.mobile-account-dropdown')
    ) {
      this.closeAccountDropdown();
    }
  }

  @HostListener('document:touchstart', ['$event'])
  onDocumentTouch(event: TouchEvent) {
    const target = event.target as HTMLElement;
    if (
      !target.closest('.account-dropdown-wrapper') &&
      !target.closest('.account-nav-wrapper') &&
      !target.closest('.mobile-account-dropdown')
    ) {
      this.closeAccountDropdown();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  openCart() {
    this.cartService.openCart();
    this.closeMenu();
  }

  openZomatoStore(){
    window.location.href='https://www.zomato.com/meerut/foody-bhai-mohan-puri/order';
  }
  
  openAuthModal() {
    this.isMenuOpen = false;
    this.closeAccountDropdown();
    this.uiService.openAuthModal();
    this.cdr.detectChanges();
  }

  closeAuthModal() {
    this.uiService.closeAuthModal();
    this.cdr.detectChanges();
  }
  
  toggleAccountDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.isAccountDropdownOpen = !this.isAccountDropdownOpen;
  }

  closeAccountDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isAccountDropdownOpen = false;
  }

  logout() {
    this.authService.logout();
    this.closeAccountDropdown();
    this.closeMenu();
  }
}

import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { LocationService } from '../../services/location.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { AuthModalComponent } from '../auth-modal/auth-modal';

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
    public uiService: UiService
  ) {}

  ngOnInit() {
    this.uiService.authModalOpen$.subscribe(isOpen => {
      this.isAuthModalOpen = isOpen;
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close dropdown if clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.account-dropdown-wrapper')) {
      this.isAccountDropdownOpen = false;
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
    this.uiService.openAuthModal();
  }

  closeAuthModal() {
    this.uiService.closeAuthModal();
  }
  
  toggleAccountDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isAccountDropdownOpen = !this.isAccountDropdownOpen;
  }

  logout() {
    this.authService.logout();
    this.isAccountDropdownOpen = false;
    this.closeMenu();
  }
}

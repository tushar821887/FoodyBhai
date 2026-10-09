import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, Address } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addresses.html',
  styleUrl: './addresses.css'
})
export class AddressesComponent implements OnInit, OnDestroy {
  savedAddresses: Address[] = [];
  
  showNewAddressForm = false;
  newAddressLabel = 'Home';
  newAddressText = '';
  isAddingAddress = false;

  private authSub!: Subscription;

  constructor(public authService: AuthService) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.authService.fetchProfile().subscribe();
    }
    this.authSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.savedAddresses = user.addresses || [];
      } else {
        this.savedAddresses = [];
      }
    });
  }

  ngOnDestroy() {
    if (this.authSub) this.authSub.unsubscribe();
  }

  toggleNewAddressForm() {
    this.showNewAddressForm = !this.showNewAddressForm;
  }

  saveNewAddress() {
    if (!this.newAddressLabel || !this.newAddressText) return;
    
    this.isAddingAddress = true;
    this.authService.addAddress({
      label: this.newAddressLabel,
      fullAddress: this.newAddressText
    }).subscribe({
      next: () => {
        this.isAddingAddress = false;
        this.showNewAddressForm = false;
        this.newAddressText = '';
        this.newAddressLabel = 'Home';
      },
      error: () => {
        this.isAddingAddress = false;
        this.errorMessage = 'Failed to save address. Please try again.';
      }
    });
  }

  deleteAddress(id: string | undefined) {
    if (!id || !confirm('Are you sure you want to delete this address?')) return;
    this.authService.deleteAddress(id).subscribe();
  }
}

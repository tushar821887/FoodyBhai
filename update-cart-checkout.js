const fs = require('fs');
const path = 'frontend/src/app/pages/cart/cart.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/checkout\(\) \{[\s\S]*\}\n\}\n/g, `checkout() {
    if (!this.authService.isLoggedIn()) {
      this.uiService.openAuthModal();
      return;
    }

    let finalAddress = this.deliveryAddress;
    
    if (this.orderType === 'delivery') {
      if (this.savedAddresses.length > 0) {
        if (!this.selectedAddressId) {
          alert("Please select a delivery address.");
          return;
        }
        const selected = this.savedAddresses.find(a => a.id === this.selectedAddressId);
        if (selected) {
          finalAddress = selected.fullAddress;
        }
      } else {
        alert("Please add a delivery address.");
        return;
      }
    } else {
      finalAddress = 'Self Pickup';
    }

    if (!this.customerName || !this.customerPhone || !finalAddress) {
      alert("Please fill in your Name and Phone Number.");
      return;
    }

    let items: CartItem[] = [];
    this.cartService.items$.subscribe(i => items = i).unsubscribe();
    
    this.orderService.placeOrder({
      items,
      totalAmount: this.currentTotal,
      orderType: this.orderType,
      deliveryDetails: {
        name: this.customerName,
        phone: this.customerPhone,
        address: finalAddress
      }
    }).subscribe({
      next: () => {
        alert("Order placed successfully!");
        this.cartService.clearCart();
        this.deliveryAddress = '';
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        console.error(err);
        alert("Failed to place order. Please try again.");
      }
    });
  }
}
`);

fs.writeFileSync(path, content);

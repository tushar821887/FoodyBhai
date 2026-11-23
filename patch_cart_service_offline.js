const fs = require('fs');

let content = fs.readFileSync('frontend/src/app/services/cart.service.ts', 'utf8');

// Add isOffline subject
content = content.replace(
  /private itemsSubject = new BehaviorSubject<CartItem\[\]>\(\[\]\);/,
  `public isOffline$ = new BehaviorSubject<boolean>(false);
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);`
);

// Add polling in constructor
content = content.replace(
  /if \(isPlatformBrowser\(this\.platformId\)\) \{/,
  `if (isPlatformBrowser(this.platformId)) {
      this.checkOfflineStatus();
      setInterval(() => this.checkOfflineStatus(), 30000);`
);

// Add checkOfflineStatus method and update addToCart
content = content.replace(
  /private loadLocalCart\(\) \{/,
  `private checkOfflineStatus() {
    this.http.get<any>(\`\${this.API_URL}/settings/restaurant_open\`).subscribe({
      next: (res) => {
        if (res && res.value !== undefined) {
          const isOpen = res.value === 'true' || res.value === true;
          this.isOffline$.next(!isOpen);
        }
      },
      error: () => {}
    });
  }

  private loadLocalCart() {`
);

content = content.replace(
  /addToCart\(recipe: Recipe\) \{/,
  `addToCart(recipe: Recipe) {
    if (this.isOffline$.value) {
      alert("We are currently offline and not accepting orders.");
      return;
    }`
);

fs.writeFileSync('frontend/src/app/services/cart.service.ts', content);
console.log('patched cart service offline');

const fs = require('fs');
const file = 'frontend/src/app/services/cart.service.ts';
let code = fs.readFileSync(file, 'utf8');

const oldAuthSub = `      this.authService.isAuthenticated$.subscribe(isAuthenticated => {
        if (isAuthenticated) {
          this.fetchRemoteCart();
        } else {
          this.loadLocalCart();
        }
      });`;

const newAuthSub = `      this.authService.isAuthenticated$.subscribe(isAuthenticated => {
        if (isAuthenticated) {
          // If logged in, get current local items and merge them with remote cart
          const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
          let localItems: CartItem[] = [];
          if (savedCart) {
            try {
              localItems = JSON.parse(savedCart);
            } catch (e) {}
          }
          this.fetchAndMergeCart(localItems);
        } else {
          this.loadLocalCart();
        }
      });`;

const oldFetch = `  private fetchRemoteCart() {
    this.http.get<{ items: CartItem[] }>(\`\${this.API_URL}/cart\`).subscribe({
      next: (cart) => {
        const items = cart?.items || [];
        this.itemsSubject.next(items);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
        }
      },
      error: (err) => console.error('Failed to fetch remote cart', err)
    });
  }`;

const newFetch = `  private fetchRemoteCart() {
    this.http.get<{ items: CartItem[] }>(\`\${this.API_URL}/cart\`).subscribe({
      next: (cart) => {
        const items = cart?.items || [];
        this.itemsSubject.next(items);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
        }
      },
      error: (err) => console.error('Failed to fetch remote cart', err)
    });
  }

  private fetchAndMergeCart(localItems: CartItem[]) {
    this.http.get<{ items: CartItem[] }>(\`\${this.API_URL}/cart\`).subscribe({
      next: (cart) => {
        let mergedItems = [...(cart?.items || [])];
        
        // Merge local items into remote items
        for (const localItem of localItems) {
          if (!localItem || !localItem.recipe) continue;
          const existingIndex = mergedItems.findIndex(i => i && i.recipe && i.recipe.id === localItem.recipe.id);
          if (existingIndex >= 0) {
            // Take the max quantity, or add them? Add them makes sense, or max. Let's add them.
            mergedItems[existingIndex].quantity += localItem.quantity;
          } else {
            mergedItems.push(localItem);
          }
        }
        
        // Sync merged cart (this will update UI, localStorage, and backend)
        this.syncCart(mergedItems);
      },
      error: (err) => console.error('Failed to fetch and merge cart', err)
    });
  }`;

code = code.replace(oldAuthSub, newAuthSub);
code = code.replace(oldFetch, newFetch);

fs.writeFileSync(file, code);
console.log("Patched cart service for merging");

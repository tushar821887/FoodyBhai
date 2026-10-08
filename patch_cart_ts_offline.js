const fs = require('fs');
let content = fs.readFileSync('frontend/src/app/pages/cart/cart.ts', 'utf8');

content = content.replace(
  /this\.orderService\.placeOrder\(\{/,
  `if (this.cartService.isOffline$.value) {
      this.isProcessing = false;
      alert("We are currently offline and not accepting orders.");
      return;
    }

    this.orderService.placeOrder({`
);

content = content.replace(
  /error: \(err\) => \{/,
  `error: (err) => {
        if (err.error && err.error.message && err.error.message.includes('offline')) {
           alert(err.error.message);
        }`
);

fs.writeFileSync('frontend/src/app/pages/cart/cart.ts', content);
console.log('patched cart component');

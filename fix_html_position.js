const fs = require('fs');
const file = 'admin-app/src/app/pages/orders/orders.page.html';
let code = fs.readFileSync(file, 'utf8');

const regex = /(<ng-container \*ngIf="currentView === 'cancel-requests'">[\s\S]*?<\/ng-container>)\s*(<!-- Mobile Bottom Navigation -->)/;

const match = code.match(regex);
if (match) {
  const cancelRequestsBlock = match[1];
  // Remove it from its current position
  code = code.replace(match[0], match[2]); // Keep mobile bottom navigation

  // Insert it right before </main>
  code = code.replace(/<\/main>/, cancelRequestsBlock + '\n\n  </main>');
  fs.writeFileSync(file, code);
  console.log("Moved cancel-requests block inside main-content!");
} else {
  console.log("Could not find the block to move.");
}

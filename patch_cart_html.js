const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'cart', 'cart.html');
let content = fs.readFileSync(htmlPath, 'utf8');

const oldDiscount = `              @if ((cartService.discount$ | async)! > 0) {
                <div class="total-row text-success">
                  <span>Discount</span>
                  <span>-₹{{cartService.discount$ | async}}</span>
                </div>
              }`;
              
const newTotals = `              @if ((cartService.discount$ | async)! > 0) {
                <div class="total-row text-success">
                  <span>Discount</span>
                  <span>-₹{{cartService.discount$ | async}}</span>
                </div>
              }
              @if ((cartService.totalPrice$ | async)! > 0) {
                <div class="total-row">
                  <span>GST (5%)</span>
                  <span>₹{{cartService.gst$ | async}}</span>
                </div>
                <div class="total-row">
                  <span>Platform Fee</span>
                  <span>₹{{cartService.platformFee$ | async}}</span>
                </div>
              }`;

content = content.replace(oldDiscount, newTotals);
fs.writeFileSync(htmlPath, content);
console.log('Fixed cart.html');

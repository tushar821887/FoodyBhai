const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.html');
let content = fs.readFileSync(htmlPath, 'utf8');

const oldReorder = `                  @if (order.status === 'delivered') {
                    <button class="btn btn-reorder" style="width: 100%; margin-top: 15px; background: var(--primary-color); border: none; padding: 10px; border-radius: 8px; color: white; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s;" (click)="reorder(order)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                      <i class="fa-solid fa-rotate-right"></i> Reorder Items
                    </button>
                  }`;
                  
const newReorderAndRate = `                  @if (order.status === 'delivered') {
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                      <button class="btn btn-reorder" style="flex: 1; background: var(--primary-color); border: none; padding: 10px; border-radius: 8px; color: white; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s;" (click)="reorder(order)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <i class="fa-solid fa-rotate-right"></i> Reorder
                      </button>
                      
                      @if (!order.rating) {
                        <button class="btn btn-rate" style="flex: 1; background: #f59e0b; border: none; padding: 10px; border-radius: 8px; color: white; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s;" (click)="openRateModal(order)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                          <i class="fa-solid fa-star"></i> Rate Order
                        </button>
                      } @else {
                        <div style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px; color: #f59e0b; font-weight: bold; background: #fffbeb; border-radius: 8px; border: 1px solid #fde68a;">
                           {{ order.rating }} <i class="fa-solid fa-star"></i>
                        </div>
                      }
                    </div>
                  }`;
                  
content = content.replace(oldReorder, newReorderAndRate);

// Add the modal at the very end
const rateModal = `
<!-- Rate Order Modal -->
<div class="modal-overlay" *ngIf="showRateModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
  <div class="modal-content" style="background: white; border-radius: 16px; padding: 30px; width: 90%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
    <div style="text-align: center; margin-bottom: 20px;">
      <h3 style="margin: 0; font-size: 22px; color: #1e293b;">Rate Your Order</h3>
      <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">How was your food from Foody Bhai?</p>
    </div>
    
    <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 25px; font-size: 32px; color: #cbd5e1; cursor: pointer;">
      <i class="fa-solid fa-star" [style.color]="ratingValue >= 1 ? '#f59e0b' : '#cbd5e1'" (click)="setRating(1)"></i>
      <i class="fa-solid fa-star" [style.color]="ratingValue >= 2 ? '#f59e0b' : '#cbd5e1'" (click)="setRating(2)"></i>
      <i class="fa-solid fa-star" [style.color]="ratingValue >= 3 ? '#f59e0b' : '#cbd5e1'" (click)="setRating(3)"></i>
      <i class="fa-solid fa-star" [style.color]="ratingValue >= 4 ? '#f59e0b' : '#cbd5e1'" (click)="setRating(4)"></i>
      <i class="fa-solid fa-star" [style.color]="ratingValue >= 5 ? '#f59e0b' : '#cbd5e1'" (click)="setRating(5)"></i>
    </div>
    
    <div style="margin-bottom: 20px;">
      <textarea [(ngModel)]="reviewText" placeholder="Leave a review (optional)..." style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 12px; font-family: inherit; font-size: 14px; min-height: 100px; resize: none; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#f59e0b'" onblur="this.style.borderColor='#e2e8f0'"></textarea>
    </div>
    
    <div style="display: flex; gap: 10px;">
      <button style="flex: 1; padding: 12px; border: none; background: #f1f5f9; color: #475569; border-radius: 10px; font-weight: bold; cursor: pointer;" (click)="showRateModal = false">Cancel</button>
      <button style="flex: 1; padding: 12px; border: none; background: #f59e0b; color: white; border-radius: 10px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);" (click)="submitRating()">Submit</button>
    </div>
  </div>
</div>
`;

content += rateModal;

fs.writeFileSync(htmlPath, content);
console.log('Fixed frontend orders.html');

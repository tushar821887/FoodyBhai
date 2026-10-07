const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const oldBlock = `                  @if (order.status === 'delivered') {
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

const newBlock = `                  @if (order.status === 'delivered') {
                    
                    @if (order.rating) {
                      <div class="order-rating-box" style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin-top: 15px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
                          <strong style="color: #92400e; font-size: 14px;">Your Feedback</strong>
                          <div style="display: flex; gap: 3px; font-size: 14px;">
                            <i class="fa-solid fa-star" [style.opacity]="1 <= order.rating ? '1' : '0.3'" style="color: #f59e0b;"></i>
                            <i class="fa-solid fa-star" [style.opacity]="2 <= order.rating ? '1' : '0.3'" style="color: #f59e0b;"></i>
                            <i class="fa-solid fa-star" [style.opacity]="3 <= order.rating ? '1' : '0.3'" style="color: #f59e0b;"></i>
                            <i class="fa-solid fa-star" [style.opacity]="4 <= order.rating ? '1' : '0.3'" style="color: #f59e0b;"></i>
                            <i class="fa-solid fa-star" [style.opacity]="5 <= order.rating ? '1' : '0.3'" style="color: #f59e0b;"></i>
                          </div>
                        </div>
                        @if (order.review) {
                          <div style="font-size: 13px; color: #b45309; font-style: italic; margin-top: 4px;">
                            "{{ order.review }}"
                          </div>
                        }
                      </div>
                    }

                    <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                      <button class="btn btn-reorder" style="flex: 1; min-width: 120px; background: var(--primary-color); border: none; padding: 12px; border-radius: 8px; color: white; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s;" (click)="reorder(order)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <i class="fa-solid fa-rotate-right"></i> Reorder
                      </button>
                      
                      @if (!order.rating) {
                        <button class="btn btn-rate" style="flex: 1; min-width: 120px; background: #fffbeb; border: 1px solid #f59e0b; padding: 12px; border-radius: 8px; color: #d97706; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s;" (click)="openRateModal(order)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                          <i class="fa-solid fa-star"></i> Rate Order
                        </button>
                      }
                    </div>
                  }`;

htmlContent = htmlContent.replace(oldBlock, newBlock);
fs.writeFileSync(htmlPath, htmlContent);
console.log('Fixed orders.html');

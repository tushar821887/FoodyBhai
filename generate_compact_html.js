const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.html');
let content = fs.readFileSync(htmlPath, 'utf8');

const orderBodyStart = content.indexOf('<div class="order-body">');
const sectionEnd = content.indexOf('</section>');

if (orderBodyStart === -1 || sectionEnd === -1) {
  console.log("Could not find delimiters");
  process.exit(1);
}

// Extract up to orderBodyStart
const part1 = content.slice(0, orderBodyStart);

// The replacement for order-body
const compactBody = `            <div class="order-compact-info" style="padding: 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc;">
              <div>
                <div style="font-size: 13px; color: #64748b; margin-bottom: 4px; font-weight: 500;">{{ order.items.length }} Item(s)</div>
                <div style="font-weight: 800; font-size: 18px; color: #1e293b;">₹{{ order.totalAmount }}</div>
              </div>
              <button class="btn btn-outline" style="padding: 8px 16px; border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 8px; color: #475569; font-weight: 600; cursor: pointer; transition: all 0.2s;" (click)="openDetailsModal(order)" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'">
                View Details
              </button>
            </div>
            
            @if (order.status === 'delivered') {
              <div style="padding: 15px; background: #fdfdfd; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
                @if (order.rating) {
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding: 8px 12px; background: #fffbeb; border-radius: 6px; border: 1px solid #fde68a;">
                    <span style="font-size: 13px; font-weight: 600; color: #b45309;">Your Rating:</span>
                    <div style="display: flex; gap: 3px; font-size: 12px;">
                      <i class="fa-solid fa-star" [style.opacity]="1 <= order.rating ? '1' : '0.3'" style="color: #f59e0b;"></i>
                      <i class="fa-solid fa-star" [style.opacity]="2 <= order.rating ? '1' : '0.3'" style="color: #f59e0b;"></i>
                      <i class="fa-solid fa-star" [style.opacity]="3 <= order.rating ? '1' : '0.3'" style="color: #f59e0b;"></i>
                      <i class="fa-solid fa-star" [style.opacity]="4 <= order.rating ? '1' : '0.3'" style="color: #f59e0b;"></i>
                      <i class="fa-solid fa-star" [style.opacity]="5 <= order.rating ? '1' : '0.3'" style="color: #f59e0b;"></i>
                    </div>
                  </div>
                }

                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  <button class="btn btn-reorder" style="flex: 1; min-width: 120px; background: var(--primary-color); border: none; padding: 10px; border-radius: 8px; color: white; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s;" (click)="reorder(order)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    <i class="fa-solid fa-rotate-right"></i> Reorder
                  </button>
                  
                  @if (!order.rating) {
                    <button class="btn btn-rate" style="flex: 1; min-width: 120px; background: #fffbeb; border: 1px solid #f59e0b; padding: 10px; border-radius: 8px; color: #d97706; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s;" (click)="openRateModal(order)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                      <i class="fa-solid fa-star"></i> Rate
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    }
  </div>
`;

// Extract part after </section>
const part2 = content.slice(sectionEnd);

// Details Modal
const detailsModal = `
<!-- Order Details Modal -->
<div class="modal-overlay" *ngIf="showDetailsModal && selectedOrderDetails" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: flex-end; justify-content: center;">
  <div class="modal-content" style="background: white; border-top-left-radius: 20px; border-top-right-radius: 20px; width: 100%; max-width: 600px; max-height: 85vh; overflow-y: auto; position: relative; animation: slideUp 0.3s ease-out;">
    <div style="position: sticky; top: 0; background: white; padding: 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; z-index: 10;">
      <div>
        <h3 style="margin: 0; font-size: 18px; color: #1e293b;">Order #{{ (selectedOrderDetails._id || selectedOrderDetails.id)?.slice(-6)?.toUpperCase() }}</h3>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">{{ selectedOrderDetails.createdAt | date:'medium' }}</p>
      </div>
      <button style="background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #475569;" (click)="closeDetailsModal()">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    
    <div style="padding: 20px;">
      <h5 style="margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px;">Items Ordered</h5>
      <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px;">
        @for (item of selectedOrderDetails.items; track $index) {
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="position: relative;">
                <img [src]="item?.recipe?.image || '/assets/images/placeholder.jpg'" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                <span style="position: absolute; top: -6px; right: -6px; background: var(--primary-color); color: white; font-size: 10px; font-weight: bold; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">{{ item?.quantity }}x</span>
              </div>
              <div>
                <h6 style="margin: 0 0 4px 0; font-size: 14px; color: #1e293b;">{{ item?.recipe?.title }}</h6>
                <span style="font-size: 13px; color: #64748b;">₹{{ item?.recipe?.price }} each</span>
              </div>
            </div>
            <div style="font-weight: 700; color: #1e293b;">
              ₹{{ (item?.recipe?.price || 0) * (item?.quantity || 1) }}
            </div>
          </div>
        }
      </div>

      <div style="border-top: 1px dashed #cbd5e1; padding-top: 20px; margin-bottom: 25px;">
        <h5 style="margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px;">Delivery Details</h5>
        <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; color: #475569; font-size: 14px;">
          <i class="fa-solid fa-user" style="margin-top: 3px; color: var(--primary-color);"></i>
          <span>{{ selectedOrderDetails?.deliveryDetails?.name }}<br>{{ selectedOrderDetails?.deliveryDetails?.phone }}</span>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 10px; color: #475569; font-size: 14px;">
          <i class="fa-solid fa-location-dot" style="margin-top: 3px; color: var(--primary-color);"></i>
          <span>{{ selectedOrderDetails?.deliveryDetails?.address }}</span>
        </div>
      </div>

      @if (selectedOrderDetails.deliveryAgent) {
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 15px; margin-bottom: 25px;">
          <h6 style="margin: 0 0 10px 0; color: #0284c7; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">🚚 Delivery Partner</h6>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; background: #e0f2fe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #0284c7;">
                <i class="fa-solid fa-user-astronaut"></i>
              </div>
              <div>
                <div style="font-weight: 600; color: #0f172a; font-size: 14px;">{{ selectedOrderDetails.deliveryAgent.name }}</div>
                <div style="font-size: 13px; color: #0369a1; font-weight: 500;">{{ selectedOrderDetails.deliveryAgent.phone }}</div>
              </div>
            </div>
            <a [href]="'tel:' + selectedOrderDetails.deliveryAgent.phone" style="background: #0284c7; color: white; text-decoration: none; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: bold; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-phone"></i> Call
            </a>
          </div>
        </div>
      }

      <div style="background: #f8fafc; border-radius: 12px; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #64748b; font-weight: 600;">Total Amount</span>
        <span style="font-size: 20px; font-weight: 800; color: var(--primary-color);">₹{{ selectedOrderDetails.totalAmount }}</span>
      </div>
      
    </div>
  </div>
</div>

<style>
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
`;

let finalContent = part1 + compactBody + part2 + "\n" + detailsModal;
fs.writeFileSync(htmlPath, finalContent);
console.log('Fixed orders.html');

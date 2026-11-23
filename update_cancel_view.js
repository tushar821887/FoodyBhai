const fs = require('fs');
const file = 'admin-app/src/app/pages/orders/orders.page.html';
let code = fs.readFileSync(file, 'utf8');

const regex = /<ng-container \*ngIf="currentView === 'cancel-requests'">([\s\S]*?)<\/ng-container>/;

const newView = `<ng-container *ngIf="currentView === 'cancel-requests'">
  <div class="settings-container animate-fade-in" style="max-width: 1000px; margin: 0 auto; padding: 20px;">
    
    <div class="settings-header-banner" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); margin-bottom: 25px; border-radius: 12px; padding: 25px; color: white; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3);">
      <div>
        <h2 style="margin: 0 0 8px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Refund & Cancel Requests</h2>
        <p style="margin: 0; opacity: 0.9; font-size: 15px;">Review cancellation requests and process pending refunds.</p>
      </div>
      <div style="background: rgba(255,255,255,0.2); border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
        🔄
      </div>
    </div>

    <div class="orders-grid">
      <!-- Filter orders that have pending cancellation request OR pending refund -->
      <div class="order-card animate-fade-in" *ngFor="let order of getCancelAndRefundOrders()" style="animation-delay: 0.1s;">
        <div class="order-header">
          <span class="order-id">#{{ (order._id || '').slice(-6) }}</span>
          <span class="time">{{ order.createdAt | date:'short' }}</span>
          <span class="status-badge" [style.backgroundColor]="getStatusBadge(order.status).color">
            {{ getStatusBadge(order.status).label }}
          </span>
        </div>
        
        <div class="customer-info" style="margin-top: 15px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 5px;">Customer Details</div>
          <strong style="color: #334155; font-size: 15px;">{{ order.deliveryDetails?.name }}</strong><br>
          <span style="color: #475569;">📞 {{ order.deliveryDetails?.phone }}</span><br>
          <span style="color: #475569; font-size: 13px;">📍 {{ order.deliveryDetails?.address }}</span>
        </div>
        
        <div class="order-items" style="margin: 15px 0;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 5px;">Order Items</div>
          <div class="item" *ngFor="let item of order.items" style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
            <strong style="color: #0ea5e9; font-weight: 800; background: #e0f2fe; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-right: 5px;">{{ item.quantity }}x</strong> 
            <span style="color: #334155;">{{ item.recipe?.title || 'Custom Item' }}</span>
          </div>
        </div>
        
        <div class="order-footer" style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 15px; margin: 0 -15px -15px -15px; border-radius: 0 0 12px 12px;">
          <div class="payment-info" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Total Amount</span>
              <strong class="total" style="font-size: 18px; color: #0f172a;">₹{{ order.totalAmount }}</strong>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
              <span style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Payment</span>
              <span class="pay-method" [class.paid]="order.paymentStatus === 'paid'" style="font-size: 14px; font-weight: 600;">
                {{ order.paymentMethod === 'online' ? 'Online' : 'COD' }} 
                <span style="opacity: 0.8; font-size: 12px;">({{ order.paymentStatus }})</span>
              </span>
            </div>
          </div>

          <!-- Cancellation Approval -->
          <div *ngIf="order.cancelRequest?.status === 'pending'" style="padding: 12px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 18px;">⚠️</span>
              <span style="font-size: 13px; color: #991b1b; font-weight: 800; text-transform: uppercase;">{{ order.cancelRequest?.requestedBy || 'Customer' }} Requested Cancellation</span>
            </div>
            <div style="font-size: 14px; color: #7f1d1d; margin-bottom: 12px; background: rgba(255,255,255,0.5); padding: 8px; border-radius: 6px; border: 1px solid rgba(252, 165, 165, 0.5);">
              <strong>Reason:</strong> {{ order.cancelRequest?.reason || 'No reason provided.' }}
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-success" style="flex: 1; padding: 10px; font-size: 14px; font-weight: 600; border-radius: 6px; display: flex; justify-content: center; align-items: center; gap: 5px;" (click)="resolveCancel(order, true)">
                ✅ Approve
              </button>
              <button class="btn btn-outline-danger" style="flex: 1; padding: 10px; font-size: 14px; font-weight: 600; border-radius: 6px; background: white; display: flex; justify-content: center; align-items: center; gap: 5px;" (click)="resolveCancel(order, false)">
                ❌ Reject
              </button>
            </div>
          </div>
          
          <!-- Refund Action -->
          <div *ngIf="order.status === 'cancelled' && order.refundStatus === 'pending'" style="padding: 12px; background: #e0e7ff; border: 1px solid #a5b4fc; border-radius: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 18px;">💸</span>
              <span style="font-size: 13px; color: #3730a3; font-weight: 800; text-transform: uppercase;">Pending Refund</span>
            </div>
            <div style="font-size: 13px; color: #312e81; margin-bottom: 12px; background: rgba(255,255,255,0.5); padding: 8px; border-radius: 6px;">
              Order has been cancelled, but the customer's refund has not yet been processed.
            </div>
            <button class="btn btn-primary" style="width: 100%; padding: 10px; font-size: 14px; font-weight: 600; background: #4f46e5; border: none; border-radius: 6px; display: flex; justify-content: center; align-items: center; gap: 5px;" (click)="processRefund(order)">
              💳 Mark Refund as Processed
            </button>
          </div>

        </div>
      </div>
      
      <div *ngIf="getCancelAndRefundOrders().length === 0" class="empty-state" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; background: white; border-radius: 12px; border: 1px dashed #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="width: 80px; height: 80px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 20px; color: #64748b;">
          ✨
        </div>
        <h3 style="margin: 0 0 10px 0; color: #334155; font-size: 20px; font-weight: 700;">All Caught Up!</h3>
        <p style="margin: 0; color: #64748b; font-size: 15px; text-align: center; max-width: 300px;">
          There are currently no pending refund or cancellation requests to process.
        </p>
      </div>
    </div>
  </div>
</ng-container>`;

code = code.replace(regex, newView);
fs.writeFileSync(file, code);
console.log("HTML patched with professional UI.");

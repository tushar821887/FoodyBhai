const fs = require('fs');
const file = 'admin-app/src/app/pages/orders/orders.page.html';
let code = fs.readFileSync(file, 'utf8');

const oldRefundHtml = `<!-- Refund Action -->
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
          </div>`;

const newRefundHtml = `<!-- Cancellation Processed / Refund Info -->
          <div *ngIf="order.status === 'cancelled'" style="padding: 12px; border-radius: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);"
               [ngStyle]="{
                 'background': order.refundStatus === 'pending' ? '#e0e7ff' : (order.refundStatus === 'completed' ? '#ecfdf5' : '#f1f5f9'),
                 'border': '1px solid ' + (order.refundStatus === 'pending' ? '#a5b4fc' : (order.refundStatus === 'completed' ? '#6ee7b7' : '#cbd5e1'))
               }">
            
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 18px;">{{ order.refundStatus === 'pending' ? '💸' : (order.refundStatus === 'completed' ? '✅' : 'ℹ️') }}</span>
              <span style="font-size: 13px; font-weight: 800; text-transform: uppercase;"
                    [ngStyle]="{'color': order.refundStatus === 'pending' ? '#3730a3' : (order.refundStatus === 'completed' ? '#065f46' : '#475569')}">
                {{ order.refundStatus === 'pending' ? 'Pending Refund' : (order.refundStatus === 'completed' ? 'Refund Completed' : 'Cancelled (No Refund Required)') }}
              </span>
            </div>
            
            <div style="font-size: 13px; margin-bottom: 12px; background: rgba(255,255,255,0.5); padding: 8px; border-radius: 6px;"
                 [ngStyle]="{'color': order.refundStatus === 'pending' ? '#312e81' : (order.refundStatus === 'completed' ? '#064e3b' : '#334155')}">
              <div *ngIf="order.cancellationDetails?.reason"><strong>Reason:</strong> {{ order.cancellationDetails?.reason }}</div>
              <div *ngIf="order.refundStatus === 'pending'">This order was paid online. Please process the refund.</div>
              <div *ngIf="order.refundStatus === 'completed'">The refund for this order has been processed.</div>
              <div *ngIf="order.refundStatus === 'none' || !order.refundStatus">This was a Cash on Delivery order, so no refund is required.</div>
            </div>
            
            <button *ngIf="order.refundStatus === 'pending'" class="btn btn-primary" style="width: 100%; padding: 10px; font-size: 14px; font-weight: 600; background: #4f46e5; border: none; border-radius: 6px; display: flex; justify-content: center; align-items: center; gap: 5px;" (click)="processRefund(order)">
              💳 Mark Refund as Processed
            </button>
          </div>`;

code = code.replace(oldRefundHtml, newRefundHtml);
fs.writeFileSync(file, code);
console.log("Updated HTML logic");

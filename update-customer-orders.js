const fs = require('fs');
const path = 'frontend/src/app/pages/orders/orders.html';
let content = fs.readFileSync(path, 'utf8');

// Replace WhatsApp text
content = content.replace(/<div class="payment-mode">[\s\S]*?<\/div>/, `<div class="payment-mode">
                    <i class="fa-solid fa-receipt" style="color: #64748b;"></i> Ordered directly
                  </div>`);

// Add Delivery Agent section if exists
const agentHtml = `
                  <!-- Delivery Agent Info -->
                  @if (order.deliveryAgent) {
                    <div class="delivery-agent-box" style="margin-top: 15px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                      <h6 style="margin: 0 0 5px 0; color: #3b82f6; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">🚚 Delivery Partner</h6>
                      <div class="detail-row" style="margin-bottom: 3px;">
                        <i class="fa-solid fa-user-astronaut"></i>
                        <span style="font-weight: 600;">{{ order.deliveryAgent.name }}</span>
                      </div>
                      <div class="detail-row">
                        <i class="fa-solid fa-phone"></i>
                        <span style="color: var(--primary-color); font-weight: 600;">{{ order.deliveryAgent.phone }}</span>
                      </div>
                    </div>
                  }
`;

content = content.replace(/<div class="detail-row address-row">[\s\S]*?<\/div>/, `<div class="detail-row address-row">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>{{ order?.deliveryDetails?.address || 'N/A' }}</span>
                  </div>
${agentHtml}`);

fs.writeFileSync(path, content);

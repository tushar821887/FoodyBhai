const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const target = `    </div>
  </div>
</div>`;

const newFooter = `    </div>
    @if (selectedOrderDetails.status === 'delivered') {
      <div style="background: white; padding: 15px 20px; border-top: 1px solid #e2e8f0; flex-shrink: 0; box-shadow: 0 -4px 10px rgba(0,0,0,0.02); z-index: 10;">
        <button style="width: 100%; padding: 12px; background: white; border: 1px solid var(--primary-color); color: var(--primary-color); border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: all 0.2s;" onmouseover="this.style.background='#fffbeb'" onmouseout="this.style.background='white'" (click)="downloadInvoice(selectedOrderDetails._id || selectedOrderDetails.id)">
          <i class="fa-solid fa-file-invoice"></i> Download Invoice
        </button>
      </div>
    }
  </div>
</div>`;

htmlContent = htmlContent.replace(target, newFooter);
fs.writeFileSync(htmlPath, htmlContent);
console.log('Fixed modal footer actually');

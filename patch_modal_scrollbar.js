const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Replace the modal-content container
htmlContent = htmlContent.replace(
  `border-radius: 20px; width: 100%; max-width: 600px; max-height: 85vh; overflow-y: auto; position: relative; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);" /* subtle bounce */`,
  `border-radius: 20px; width: 100%; max-width: 600px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; position: relative; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);"`
);

// Replace the header div
htmlContent = htmlContent.replace(
  `<div style="position: sticky; top: 0; background: white; padding: 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; z-index: 10;">`,
  `<div style="background: white; padding: 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">`
);

// Replace the body div
htmlContent = htmlContent.replace(
  `<div style="padding: 20px;">
      <h5 style="margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px;">Items Ordered</h5>`,
  `<div style="padding: 20px; overflow-y: auto; flex: 1;">
      <h5 style="margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px;">Items Ordered</h5>`
);

fs.writeFileSync(htmlPath, htmlContent);
console.log('Fixed modal scrollbar clipping');

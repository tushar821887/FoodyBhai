const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'frontend', 'src', 'app', 'pages', 'orders', 'orders.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Replace flex-end with center
htmlContent = htmlContent.replace(
  `align-items: flex-end; justify-content: center;"`,
  `align-items: center; justify-content: center; padding: 20px;"`
);

// Replace border radius and animation
htmlContent = htmlContent.replace(
  `border-top-left-radius: 20px; border-top-right-radius: 20px; width: 100%; max-width: 600px; max-height: 85vh; overflow-y: auto; position: relative; animation: slideUp 0.3s ease-out;"`,
  `border-radius: 20px; width: 100%; max-width: 600px; max-height: 85vh; overflow-y: auto; position: relative; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);" /* subtle bounce */`
);

// We need to add popIn to styles
if (!htmlContent.includes('@keyframes popIn')) {
  htmlContent = htmlContent.replace(
    `</style>`,
    `@keyframes popIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>`
  );
}

fs.writeFileSync(htmlPath, htmlContent);
console.log('Fixed modal position and styling');

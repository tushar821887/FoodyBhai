const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'frontend', 'src', 'app', 'components', 'footer', 'footer.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// The logo has margin-bottom: 0px. Let's make it 15px so it doesn't touch the text.
htmlContent = htmlContent.replace(`margin-bottom: 0px;`, `margin-bottom: 15px;`);

// Fix the height of the logo so it's not overly huge
htmlContent = htmlContent.replace(`height: 120px;`, `height: 100px;`);

fs.writeFileSync(htmlPath, htmlContent);
console.log('Fixed footer html');

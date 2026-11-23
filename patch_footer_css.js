const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'frontend', 'src', 'app', 'components', 'footer', 'footer.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

cssContent = cssContent.replace(
  `grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 3rem;`,
  `grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 2rem;`
);

cssContent = cssContent.replace(
  `.footer-contact li {
  color: #a4b0be;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}`,
  `.footer-contact li {
  color: #a4b0be;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  word-break: break-word;
}`
);

fs.writeFileSync(cssPath, cssContent);
console.log('Fixed footer css');

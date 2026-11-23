const fs = require('fs');
const path = require('path');

// --- header.html ---
const htmlPath = path.join(__dirname, 'frontend', 'src', 'app', 'components', 'header', 'header.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const oldLocSpan = `<span class="loc-value">{{ (locationService.location$ | async) || 'Select Location' }} <i class="fa-solid fa-chevron-down"></i></span>`;
const newLocSpan = `<span class="loc-value"><span class="loc-value-text">{{ (locationService.location$ | async) || 'Select Location' }}</span> <i class="fa-solid fa-chevron-down"></i></span>`;
htmlContent = htmlContent.replace(oldLocSpan, newLocSpan);
fs.writeFileSync(htmlPath, htmlContent);

// --- header.css ---
const cssPath = path.join(__dirname, 'frontend', 'src', 'app', 'components', 'header', 'header.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const oldCssLoc = `.loc-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--secondary-color);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
}`;

const newCssLoc = `.loc-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--secondary-color);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.loc-value-text {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}`;

cssContent = cssContent.replace(oldCssLoc, newCssLoc);
cssContent = cssContent.replace(".loc-value {\n    max-width: 180px;\n  }", ".loc-value-text {\n    max-width: 160px;\n  }");

fs.writeFileSync(cssPath, cssContent);
console.log('Fixed header.html and header.css');

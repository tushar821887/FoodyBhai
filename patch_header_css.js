const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'frontend', 'src', 'app', 'components', 'header', 'header.css');
let content = fs.readFileSync(cssPath, 'utf8');

const oldLocValue = `.loc-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--secondary-color);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}`;

const newLocValue = `.loc-value {
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

// I don't know the exact block, I will use replace with regex.
content = content.replace(/\.loc-value \{\s*font-size: 0\.9rem;\s*font-weight: 600;\s*color: var\(--secondary-color\);\s*display: flex;\s*align-items: center;\s*gap: 0\.3rem;\s*white-space: nowrap;\s*max-width: 150px;\s*overflow: hidden;\s*text-overflow: ellipsis;\s*\}/, newLocValue);

// If overflow isn't there:
content = content.replace(/max-width: 150px;/, "max-width: 250px;\n  overflow: hidden;\n  text-overflow: ellipsis;");
content = content.replace(/max-width: 100px;/, "max-width: 180px;");

fs.writeFileSync(cssPath, content);
console.log('Fixed header.css');

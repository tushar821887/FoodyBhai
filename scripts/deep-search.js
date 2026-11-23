const fs = require('fs');

const data = JSON.parse(fs.readFileSync('zomato_full_menu_parsed.json', 'utf8'));

// Recursively find keys containing "macroni" or "navratri"
function searchObj(obj, path = '') {
  if (!obj) return;
  if (typeof obj === 'string') {
    if (/macroni|macaroni|navratri/i.test(obj)) {
      console.log(`Match at ${path}: ${obj.substring(0, 100)}`);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, idx) => searchObj(item, `${path}[${idx}]`));
  } else if (typeof obj === 'object') {
    for (const [key, val] of Object.entries(obj)) {
      searchObj(val, `${path}.${key}`);
    }
  }
}

console.log('Searching in zomato_full_menu_parsed.json...');
searchObj(data.pages);

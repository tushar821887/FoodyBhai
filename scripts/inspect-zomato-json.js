const fs = require('fs');

const html = fs.readFileSync('zomato_raw.html', 'utf8');

// Find the string around "Red Sauce Pasta + Macroni"
const idx = html.indexOf('Red Sauce Pasta + Macroni');
if (idx !== -1) {
  console.log('Context around Red Sauce Pasta + Macroni:');
  console.log(html.substring(Math.max(0, idx - 200), Math.min(html.length, idx + 400)));
}

// Find the string around "Navratri Special Menu"
const idxNav = html.indexOf('Navratri Special Menu');
if (idxNav !== -1) {
  console.log('\nContext around Navratri Special Menu:');
  console.log(html.substring(Math.max(0, idxNav - 100), Math.min(html.length, idxNav + 500)));
}

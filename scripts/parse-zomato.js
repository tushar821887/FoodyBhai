const fs = require('fs');

const html = fs.readFileSync('zomato_raw.html', 'utf8');

// Check if __NEXT_DATA__ is present
const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
if (match) {
  console.log('Found __NEXT_DATA__!');
  const data = JSON.parse(match[1]);
  fs.writeFileSync('zomato_parsed.json', JSON.stringify(data, null, 2));
  console.log('Saved zomato_parsed.json');
} else {
  console.log('__NEXT_DATA__ not found. Searching text in HTML directly...');
}

// Search for Macroni and Navratri in html
const lines = html.split('\n');
console.log('Scanning for keywords...');
const foundKeywords = [];
['macroni', 'macaroni', 'navratri', 'vrat'].forEach(kw => {
  const regex = new RegExp(kw, 'gi');
  let count = 0;
  let matches = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    count++;
    const start = Math.max(0, m.index - 100);
    const end = Math.min(html.length, m.index + 200);
    matches.push(html.substring(start, end).replace(/\s+/g, ' '));
    if (matches.length >= 5) break;
  }
  console.log(`Keyword "${kw}": found ${count} occurrences`);
  matches.forEach((snippet, i) => console.log(`  [${kw} ${i+1}]: ${snippet}`));
});

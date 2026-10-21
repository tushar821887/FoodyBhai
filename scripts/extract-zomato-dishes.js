const fs = require('fs');

const html = fs.readFileSync('zomato_raw.html', 'utf8');

// Find all JSON blobs containing items or menu
// In Zomato HTML, there are embedded escaped JSON strings or scripts
const items = [];

// Look for {"item":{...}} patterns
const itemRegex = /\{"item":\{"id":"([^"]+)","name":"([^"]+)",[\s\S]*?"price":([0-9.]+),[\s\S]*?"desc":"([^"]*)"/g;
let match;
while ((match = itemRegex.exec(html)) !== null) {
  // Let's also find image if available
  const snippet = html.substring(match.index, match.index + 1200);
  let imageUrl = '';
  const imgMatch = snippet.match(/"image_url":"([^"]+)"/) || snippet.match(/"imageUrl":"([^"]+)"/) || snippet.match(/src="([^"]*zmtcdn[^"]*)"/);
  if (imgMatch) imageUrl = imgMatch[1];
  
  items.push({
    id: match[1],
    name: match[2],
    price: parseFloat(match[3]),
    desc: match[4],
    imageUrl: imageUrl.replace(/\\u002F/g, '/').replace(/\\\//g, '/')
  });
}

console.log(`Found ${items.length} items using regex 1`);

// Also look for schema.org or other scripts
const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
if (schemaMatch) {
  console.log(`Found ${schemaMatch.length} ld+json script tags`);
  schemaMatch.forEach((s, idx) => {
    try {
      const clean = s.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '');
      const json = JSON.parse(clean);
      if (json['@type'] === 'Menu' || json.hasMenuSection) {
        console.log(`Script ${idx} is Menu: sections count:`, json.hasMenuSection?.length);
        fs.writeFileSync('zomato_menu_ldjson.json', JSON.stringify(json, null, 2));
      }
    } catch (e) {}
  });
}

// Let's also search for all occurrences of "name":"..." and "price":... in JSON blocks
const allDishes = [];
const dishBlockRegex = /"name":"([^"]+)","price":([0-9.]+),"desc":"([^"]*)"/g;
while ((match = dishBlockRegex.exec(html)) !== null) {
  const nearby = html.substring(Math.max(0, match.index - 300), Math.min(html.length, match.index + 800));
  let img = '';
  const imgM = nearby.match(/https:\/\/[^"\s\\]*zmtcdn\.com\/[^"\s\\]*\.(?:jpg|jpeg|png|webp)/i);
  if (imgM) img = imgM[0];
  
  allDishes.push({
    name: match[1],
    price: parseFloat(match[2]),
    desc: match[3],
    image: img
  });
}
console.log(`Found ${allDishes.length} dishes with dishBlockRegex`);

// Deduplicate
const unique = new Map();
allDishes.forEach(d => {
  if (!unique.has(d.name)) {
    unique.set(d.name, d);
  }
});
console.log(`Unique dishes count: ${unique.size}`);

fs.writeFileSync('zomato_extracted_dishes.json', JSON.stringify([...unique.values()], null, 2));
console.log('Saved zomato_extracted_dishes.json');

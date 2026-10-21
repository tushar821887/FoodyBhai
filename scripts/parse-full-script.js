const fs = require('fs');

const script = fs.readFileSync('zomato_page_script.txt', 'utf8');

// Let's see the beginning of the script
console.log('Script preview (first 300 chars):');
console.log(script.substring(0, 300));

// Find JSON.parse(...)
const parseIdx = script.indexOf('JSON.parse(');
if (parseIdx !== -1) {
  console.log('Found JSON.parse at:', parseIdx);
  // Extract string passed to JSON.parse
  // usually JSON.parse("...")
  const firstQuote = script.indexOf('"', parseIdx);
  let endQuote = script.lastIndexOf('")');
  if (endQuote === -1) endQuote = script.lastIndexOf('"');
  console.log('String between', firstQuote, 'and', endQuote);
  const rawString = script.substring(firstQuote + 1, endQuote);
  // Unescape
  try {
    const unescaped = JSON.parse('"' + rawString + '"');
    const parsedData = JSON.parse(unescaped);
    console.log('SUCCESSFULLY PARSED DATA!');
    fs.writeFileSync('zomato_full_menu_parsed.json', JSON.stringify(parsedData, null, 2));
    console.log('Saved zomato_full_menu_parsed.json! Keys:', Object.keys(parsedData));
  } catch (e) {
    console.error('Failed to parse:', e.message);
  }
}

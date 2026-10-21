const fs = require('fs');

const html = fs.readFileSync('zomato_raw.html', 'utf8');

const idx = html.indexOf('ctl_813487131');
console.log('Index of ctl_813487131:', idx);
if (idx !== -1) {
  // Let's find where this JSON string starts and ends
  const start = html.lastIndexOf('<script', idx);
  const end = html.indexOf('</script>', idx);
  console.log('Script tag starts at:', start, 'ends at:', end);
  if (start !== -1 && end !== -1) {
    const scriptContent = html.substring(start, end + 9);
    fs.writeFileSync('zomato_page_script.txt', scriptContent);
    console.log('Saved zomato_page_script.txt, length:', scriptContent.length);
  }
}

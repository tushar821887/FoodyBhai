const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'www.zomato.com',
  path: '/meerut/foody-bhai-mohan-puri/order',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache'
  }
};

https.get(options, res => {
  console.log('Status:', res.statusCode);
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    console.log('Redirect to:', res.headers.location);
  }
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Data length:', data.length);
    fs.writeFileSync('zomato_raw.html', data);
    console.log('Saved zomato_raw.html');
  });
}).on('error', e => console.error(e));

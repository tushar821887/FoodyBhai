const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:4200/menu', { waitUntil: 'networkidle0' });
  
  await page.screenshot({ path: '/tmp/menu-screenshot.png' });
  console.log('Screenshot saved to /tmp/menu-screenshot.png');
  
  await browser.close();
})();

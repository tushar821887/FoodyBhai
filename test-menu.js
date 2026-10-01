const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto('http://localhost:4200/menu', { waitUntil: 'networkidle0' });
  
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  console.log('Body length:', bodyHTML.length);
  
  await browser.close();
})();

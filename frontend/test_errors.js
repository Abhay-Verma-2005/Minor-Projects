import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  try {
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2', timeout: 5000 });
  } catch (e) {
    console.log('Navigation error:', e.message);
  }
  
  await browser.close();
})();

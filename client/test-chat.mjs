import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) {
      console.log('BROWSER_NETWORK_ERROR:', response.url(), response.status());
    }
  });

  try {
    console.log("Navigating to ChatPage...");
    await page.goto('http://localhost:5173/helping-center/chat?conv=req_6a79d551e966168d3e6a0192_6a76ec5a725dd42fe5736053_6a76ec5a725dd42fe5736051', { waitUntil: 'networkidle0' });
    console.log("Navigation complete.");
    await new Promise(r => setTimeout(r, 2000));
  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    await browser.close();
  }
})();

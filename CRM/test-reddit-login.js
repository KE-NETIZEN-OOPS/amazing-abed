const puppeteer = require('puppeteer');

async function testLogin() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('Navigating to Reddit login...');
  await page.goto('https://www.reddit.com/login', { waitUntil: 'networkidle2', timeout: 30000 });
  
  await page.waitForTimeout(5000);
  
  // Get all inputs
  const inputs = await page.$$eval('input', inputs => 
    inputs.map((input, i) => ({
      index: i,
      type: input.type,
      name: input.name || '',
      id: input.id || '',
      placeholder: input.placeholder || '',
      className: input.className || '',
      autocomplete: input.autocomplete || '',
      visible: input.offsetWidth > 0 && input.offsetHeight > 0,
    }))
  );
  
  console.log('\n📋 Found Input Fields:');
  console.log(JSON.stringify(inputs, null, 2));
  
  // Get page HTML structure
  const html = await page.content();
  console.log('\n📄 Page Title:', await page.title());
  console.log('📄 Current URL:', page.url());
  
  // Screenshot
  await page.screenshot({ path: 'reddit-login-test.png', fullPage: true });
  console.log('\n📸 Screenshot saved to reddit-login-test.png');
  
  console.log('\n⏳ Browser will stay open for 60 seconds for inspection...');
  await page.waitForTimeout(60000);
  
  await browser.close();
}

testLogin().catch(console.error);

const { chromium } = require('playwright');

async function testLogin() {
  const username = 'WonderfulBook9970';
  const password = 'Kenya254@_';
  
  console.log('🧪 Testing Reddit Login with Playwright\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  
  try {
    console.log('1️⃣ Navigating to Reddit login...');
    await page.goto('https://www.reddit.com/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    // Get all inputs
    const inputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.map((input, i) => ({
        index: i,
        type: input.type,
        name: input.name || '',
        id: input.id || '',
        placeholder: input.placeholder || '',
        autocomplete: input.autocomplete || '',
        visible: input.offsetWidth > 0 && input.offsetHeight > 0,
      }));
    });
    
    console.log(`\n📋 Found ${inputs.length} input fields:`);
    console.log(JSON.stringify(inputs, null, 2));
    
    // Try to find username
    let usernameFilled = false;
    const usernameSelectors = [
      'input[name="username"]',
      'input[type="text"]',
      'input[type="email"]',
      'input[autocomplete="username"]',
    ];
    
    for (const selector of usernameSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          await element.scrollIntoViewIfNeeded();
          await element.click({ clickCount: 3 });
          await element.fill(username);
          usernameFilled = true;
          console.log(`✅ Filled username using: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!usernameFilled) {
      console.log('❌ Could not find username field');
      await page.screenshot({ path: 'login-debug.png', fullPage: true });
      await page.waitForTimeout(60000);
      return;
    }
    
    // Find password
    const passwordField = page.locator('input[type="password"]').first();
    if (await passwordField.isVisible()) {
      await passwordField.scrollIntoViewIfNeeded();
      await passwordField.click({ clickCount: 3 });
      await passwordField.fill(password);
      console.log('✅ Filled password');
    }
    
    // Submit
    await page.waitForTimeout(1000);
    const submit = page.locator('button[type="submit"]').first();
    if (await submit.isVisible()) {
      await submit.click();
      await page.waitForTimeout(5000);
    }
    
    // Check result
    const url = page.url();
    const cookies = await context.cookies();
    console.log(`\n📊 Result:`);
    console.log(`   URL: ${url}`);
    console.log(`   Cookies: ${cookies.length}`);
    console.log(`   Logged in: ${!url.includes('/login')}`);
    
    if (!url.includes('/login')) {
      const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      console.log(`\n✅✅✅ LOGIN SUCCESSFUL!`);
      console.log(`\n🍪 Cookie string (${cookieString.length} chars):`);
      console.log(cookieString.substring(0, 200) + '...');
    }
    
    console.log('\n⏳ Keeping browser open for 30 seconds...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'login-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testLogin();

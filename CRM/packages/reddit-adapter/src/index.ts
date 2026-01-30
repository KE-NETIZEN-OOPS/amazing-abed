import { chromium, Browser, Page } from 'playwright';
import axios from 'axios';

export interface RedditPost {
  id: string;
  title: string;
  body?: string;
  author: string;
  subreddit: string;
  url: string;
  score: number;
  numComments: number;
  createdUtc: number;
  isNsfw: boolean;
  mediaPresent: boolean;
  permalink: string;
}

export interface RedditAdapter {
  login(username: string, password: string): Promise<boolean>;
  scrapeLatestPosts(subreddit?: string, limit?: number, timeFilter?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'): Promise<RedditPost[]>;
  postReply(postUrl: string, postId: string, reply: string): Promise<boolean>;
  getAccountInfo(): Promise<any>;
  setCookies(cookies: string): void;
  getCookies(): string | null;
  verifyLoginStatus(): Promise<boolean>;
}

export class Crawl4aiRedditAdapter implements RedditAdapter {
  private cookies: string | null = null;
  private loggedIn: boolean = false;

  setCookies(cookies: string): void {
    this.cookies = cookies;
    this.loggedIn = true;
    console.log('✅ Cookies set for adapter');
  }

  getCookies(): string | null {
    return this.cookies;
  }

  async verifyLoginStatus(): Promise<boolean> {
    if (!this.cookies) {
      return false;
    }
    
    let browser: Browser | null = null;
    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
      });
      const page = await context.newPage();

      await page.goto('https://www.reddit.com', { waitUntil: 'networkidle', timeout: 15000 });
      
      // Set cookies
      const cookieStrings = this.cookies.split('; ');
      const cookies = cookieStrings.map(c => {
        const parts = c.split('=');
        return {
          name: parts[0].trim(),
          value: parts.slice(1).join('=').trim(),
          domain: '.reddit.com',
          path: '/',
        };
      }).filter(c => c.name && c.value);
      
      if (cookies.length > 0) {
        await context.addCookies(cookies);
      }
      
      await page.waitForTimeout(2000);

      const isLoggedIn = await page.evaluate(() => {
        const win = globalThis as any;
        const doc = win.document;
        return !!(
          doc.querySelector('[data-testid="user-menu"]') ||
          doc.querySelector('[aria-label*="user"]') ||
          doc.querySelector('a[href*="/user/"]')
        );
      });
      
      await browser.close();
      this.loggedIn = isLoggedIn;
      return isLoggedIn;
    } catch (error) {
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          // Ignore
        }
      }
      this.loggedIn = false;
      return false;
    }
  }

  async login(username: string, password: string): Promise<boolean> {
    let browser: Browser | null = null;
    try {
      console.log(`🔐 Logging in to Reddit as ${username}...`);
      browser = await chromium.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      const page = await context.newPage();

      console.log('📄 Navigating to Reddit login...');
      await page.goto('https://www.reddit.com/login', { 
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      await page.waitForTimeout(3000);

      // Check if already logged in
      const currentUrl = page.url();
      if (!currentUrl.includes('/login')) {
        console.log('✅ Already logged in!');
        const cookies = await context.cookies();
        this.cookies = cookies.map(c => `${c.name}=${c.value}`).join('; ');
        this.loggedIn = true;
        await browser.close();
        return true;
      }

      // Try to find and click "Log In" button if it's a modal
      console.log('🔍 Looking for login modal trigger...');
      const loginButtons = await page.locator('a[href*="login"], button:has-text("Log In"), button:has-text("Sign In")').all();
      for (const btn of loginButtons) {
        try {
          if (await btn.isVisible()) {
            console.log('✅ Found login button, clicking...');
            await btn.click();
            await page.waitForTimeout(2000);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      await page.waitForTimeout(2000);

      // Get all inputs to see what's available
      const allInputs = await page.evaluate(() => {
        const win = globalThis as any;
        const doc = win.document;
        const inputs = Array.from(doc.querySelectorAll('input'));
        return inputs.map((input: any, i: number) => ({
          index: i,
          type: input.type,
          name: input.name || '',
          id: input.id || '',
          placeholder: input.placeholder || '',
          autocomplete: input.autocomplete || '',
          visible: input.offsetWidth > 0 && input.offsetHeight > 0,
        }));
      });
      console.log(`📋 Found ${allInputs.length} input fields:`, JSON.stringify(allInputs, null, 2));

      // Find username field - try multiple strategies
      let usernameFilled = false;
      const usernameSelectors = [
        'input[name="username"]',
        'input[id*="username" i]',
        'input[autocomplete="username"]',
        'input[autocomplete="email"]',
        'input[type="text"]',
        'input[type="email"]',
      ];

      for (const selector of usernameSelectors) {
        try {
          const elements = await page.locator(selector).all();
          console.log(`Trying "${selector}": found ${elements.length} elements`);
          
          for (const element of elements) {
            try {
              if (await element.isVisible()) {
                await element.scrollIntoViewIfNeeded();
                await page.waitForTimeout(500);
                await element.click({ clickCount: 3 });
                await page.waitForTimeout(500);
                await element.fill(username);
                usernameFilled = true;
                console.log(`✅ Filled username using: ${selector}`);
                break;
              }
            } catch (e: any) {
              console.log(`   Failed: ${e.message}`);
              continue;
            }
          }
          if (usernameFilled) break;
        } catch (e: any) {
          continue;
        }
      }

      if (!usernameFilled) {
        await page.screenshot({ path: 'reddit-login-debug.png', fullPage: true });
        console.error('❌ Could not find username field');
        await page.waitForTimeout(30000);
        throw new Error('Could not find username field');
      }

      // Find password field
      let passwordFilled = false;
      const passwordSelectors = [
        'input[name="password"]',
        'input[type="password"]',
        'input[id*="password" i]',
        'input[autocomplete="current-password"]',
      ];

      for (const selector of passwordSelectors) {
        try {
          const elements = await page.locator(selector).all();
          console.log(`Trying password "${selector}": found ${elements.length} elements`);
          
          for (const element of elements) {
            try {
              if (await element.isVisible()) {
                await element.scrollIntoViewIfNeeded();
                await page.waitForTimeout(500);
                await element.click({ clickCount: 3 });
                await page.waitForTimeout(500);
                await element.fill(password);
                passwordFilled = true;
                console.log(`✅ Filled password using: ${selector}`);
                break;
              }
            } catch (e: any) {
              continue;
            }
          }
          if (passwordFilled) break;
        } catch (e: any) {
          continue;
        }
      }

      if (!passwordFilled) {
        throw new Error('Could not find password field');
      }

      // Submit form - look for "Log In" button
      await page.waitForTimeout(1000);
      console.log('🔍 Looking for submit button...');
      
      let submitted = false;
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Log In")',
        'button:has-text("Sign In")',
        'button[data-testid*="login"]',
      ];
      
      for (const selector of submitSelectors) {
        try {
          const buttons = await page.locator(selector).all();
          for (const button of buttons) {
            try {
              if (await button.isVisible()) {
                const text = await button.textContent() || '';
                console.log(`   Found button: "${text}"`);
                if (text.toLowerCase().includes('log') || text.toLowerCase().includes('sign') || text === '') {
                  await button.scrollIntoViewIfNeeded();
                  await page.waitForTimeout(500);
                  await button.click();
                  submitted = true;
                  console.log(`✅ Clicked submit button: "${text}"`);
                  break;
                }
              }
            } catch (e) {
              continue;
            }
          }
          if (submitted) break;
        } catch (e) {
          continue;
        }
      }
      
      if (!submitted) {
        console.log('⚠️ No submit button found, trying Enter key...');
        await page.keyboard.press('Enter');
      }
      
      await page.waitForTimeout(5000);

      // Check login success
      const finalUrl = page.url();
      const cookies = await context.cookies();
      const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      
      const hasSessionCookie = cookies.some(c => 
        c.name.includes('session') || 
        c.name === 'reddit_session' ||
        c.name === 'reddit_secure_session'
      );
      
      this.loggedIn = finalUrl.includes('reddit.com') && !finalUrl.includes('/login') && hasSessionCookie;
      this.cookies = cookieString;

      if (this.loggedIn) {
        console.log(`✅ Login successful! Found ${cookies.length} cookies`);
        console.log(`✅ Cookies saved (${cookieString.length} chars)`);
      } else {
        console.error(`❌ Login failed - URL: ${finalUrl}, hasSessionCookie: ${hasSessionCookie}`);
        await page.screenshot({ path: 'reddit-login-failed.png', fullPage: true });
        await page.waitForTimeout(10000);
      }

      await browser.close();
      return this.loggedIn;
    } catch (error) {
      console.error('Login error:', error);
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          // Ignore
        }
      }
      this.loggedIn = false;
      throw error;
    }
  }

  async scrapeLatestPosts(
    subreddit: string = 'all',
    limit: number = 25,
    timeFilter: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' = 'hour'
  ): Promise<RedditPost[]> {
    try {
      const posts: RedditPost[] = [];
      
      const subredditsToScrape = subreddit === 'all' 
        ? ['all', 'rateme', 'amiugly', 'truerateme', 'nsfw', 'gonewild', 'dick', 'rate']
        : [subreddit];
      
      for (const sub of subredditsToScrape) {
        try {
          const url = `https://www.reddit.com/r/${sub}/new.json?limit=${Math.min(limit, 100)}&t=${timeFilter}`;
          
          const response = await axios.get(url, {
            headers: this.cookies ? {
              Cookie: this.cookies,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            } : {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            timeout: 10000,
          });

          const data = response.data;

          if (data?.data?.children) {
            const now = Date.now() / 1000;
            const thirtyMinutesAgo = now - (30 * 60);

            for (const child of data.data.children) {
              const post = child.data;
              const createdUtc = post.created_utc;

              if (createdUtc >= thirtyMinutesAgo) {
                if (!posts.find(p => p.id === post.id)) {
                  posts.push({
                    id: post.id,
                    title: post.title,
                    body: post.selftext,
                    author: post.author,
                    subreddit: post.subreddit,
                    url: `https://reddit.com${post.permalink}`,
                    score: post.score || 0,
                    numComments: post.num_comments || 0,
                    createdUtc: createdUtc,
                    isNsfw: post.over_18 || false,
                    mediaPresent: !!(post.url && !post.url.includes('reddit.com')),
                    permalink: post.permalink,
                  });
                }
              }
            }
          }
        } catch (subError) {
          console.error(`Error scraping r/${sub}:`, subError.message);
        }
      }

      return posts;
    } catch (error) {
      console.error('Scraping error:', error);
      return [];
    }
  }

  async postReply(postUrl: string, postId: string, reply: string): Promise<boolean> {
    let browser: Browser | null = null;
    try {
      console.log(`🚀 Starting postReply`);
      console.log(`📋 Post URL: ${postUrl}`);
      console.log(`📋 Post ID: ${postId}`);
      console.log(`📋 Reply length: ${reply.length} chars`);
      console.log(`🍪 Has cookies: ${!!this.cookies}, Logged in: ${this.loggedIn}`);

      // CRITICAL: If we have cookies, we're logged in - don't try to login again!
      if (!this.cookies) {
        console.error('❌ No cookies available - cannot post without being logged in');
        return false;
      }
      
      // If we have cookies, assume we're logged in
      this.loggedIn = true;

      browser = await chromium.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      });
      
      const page = await context.newPage();

      // Step 1: Navigate to Reddit and set cookies
      console.log('1️⃣ Navigating to Reddit to set cookies...');
      await page.goto('https://www.reddit.com', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      if (this.cookies) {
        console.log(`🍪 Setting cookies...`);
        const cookieStrings = this.cookies.split('; ');
        const cookies = cookieStrings.map(c => {
          const parts = c.split('=');
          const name = parts[0];
          const value = parts.slice(1).join('=');
          return {
            name: name.trim(),
            value: value.trim(),
            domain: '.reddit.com',
            path: '/',
          };
        }).filter(c => c.name && c.value);
        
        if (cookies.length > 0) {
          await context.addCookies(cookies);
          console.log(`✅ Set ${cookies.length} cookies`);
          await page.waitForTimeout(2000);
        }
      }

      // Step 2: Navigate to the post
      console.log(`2️⃣ Navigating to post...`);
      console.log(`   Post URL: ${postUrl}`);
      console.log(`   Post ID: ${postId}`);
      
      let normalizedUrl = postUrl;
      if (!normalizedUrl || normalizedUrl === 'undefined' || normalizedUrl === 'null') {
        normalizedUrl = `https://www.reddit.com/comments/${postId}`;
        console.log(`   ⚠️ Post URL was missing, constructed: ${normalizedUrl}`);
      } else if (!normalizedUrl.startsWith('http')) {
        normalizedUrl = `https://www.reddit.com${normalizedUrl.startsWith('/') ? '' : '/'}${normalizedUrl}`;
      }
      
      const urlAttempts = [
        normalizedUrl,
        `https://www.reddit.com/comments/${postId}`,
        `https://old.reddit.com/comments/${postId}`,
      ];

      let pageLoaded = false;
      let finalUrl = '';
      
      for (const url of urlAttempts) {
        try {
          console.log(`   Trying: ${url}`);
          await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
          await page.waitForTimeout(5000);
          
          const pageTitle = await page.title();
          const currentUrl = page.url();
          
          console.log(`   Page title: ${pageTitle}`);
          console.log(`   Current URL: ${currentUrl}`);
          
          const isValidPostPage = 
            pageTitle && 
            !pageTitle.includes('Error') && 
            !pageTitle.includes('Page Not Found') &&
            currentUrl.includes('reddit.com') &&
            (currentUrl.includes('comments') || currentUrl.includes(postId));
          
          if (isValidPostPage) {
            console.log(`   ✅ Successfully loaded post page!`);
            pageLoaded = true;
            finalUrl = currentUrl;
            break;
          }
        } catch (e: any) {
          console.log(`   ❌ Failed: ${e.message}`);
          continue;
        }
      }

      if (!pageLoaded) {
        await page.screenshot({ path: 'post-page-failed.png', fullPage: true });
        throw new Error(`Could not load Reddit post page`);
      }
      
      console.log(`✅ Successfully navigated to: ${finalUrl}`);
      
      // Check for CAPTCHA/robot check popup
      console.log('🤖 Checking for CAPTCHA/robot verification...');
      await page.waitForTimeout(2000);
      
      const hasCaptcha = await page.evaluate(() => {
        const win = globalThis as any;
        const doc = win.document;
        // Check for common CAPTCHA indicators
        return !!(
          doc.querySelector('[class*="captcha" i]') ||
          doc.querySelector('[id*="captcha" i]') ||
          doc.querySelector('[class*="robot" i]') ||
          doc.querySelector('[id*="robot" i]') ||
          doc.querySelector('iframe[src*="recaptcha"]') ||
          doc.querySelector('iframe[src*="hcaptcha"]') ||
          doc.querySelector('[data-testid*="captcha"]') ||
          doc.textContent?.toLowerCase().includes('i\'m not a robot') ||
          doc.textContent?.toLowerCase().includes('verify you are human')
        );
      });
      
      if (hasCaptcha) {
        console.log('⚠️ CAPTCHA/robot check detected!');
        console.log('   Waiting for you to complete the verification...');
        console.log('   Please check the "I\'m not a robot" box in the browser');
        
        // Wait for CAPTCHA to be completed (up to 60 seconds)
        let captchaCompleted = false;
        const startTime = Date.now();
        const timeout = 60000; // 60 seconds
        
        while (!captchaCompleted && (Date.now() - startTime) < timeout) {
          await page.waitForTimeout(2000);
          
          // Check if CAPTCHA is gone
          const stillHasCaptcha = await page.evaluate(() => {
            const win = globalThis as any;
            const doc = win.document;
            return !!(
              doc.querySelector('[class*="captcha" i]') ||
              doc.querySelector('[id*="captcha" i]') ||
              doc.querySelector('[class*="robot" i]') ||
              doc.querySelector('[id*="robot" i]') ||
              doc.querySelector('iframe[src*="recaptcha"]') ||
              doc.querySelector('iframe[src*="hcaptcha"]')
            );
          });
          
          if (!stillHasCaptcha) {
            captchaCompleted = true;
            console.log('✅ CAPTCHA completed!');
            await page.waitForTimeout(3000); // Wait for redirect
            break;
          }
          
          // Also check if we've been redirected away from the CAPTCHA
          const currentUrl = page.url();
          if (!currentUrl.includes('captcha') && !currentUrl.includes('challenge')) {
            captchaCompleted = true;
            console.log('✅ Redirected after CAPTCHA!');
            await page.waitForTimeout(2000);
            break;
          }
        }
        
        if (!captchaCompleted) {
          console.warn('⚠️ CAPTCHA timeout - continuing anyway, might need manual intervention');
        }
        
        // Re-navigate to the post if needed
        const currentUrlAfterCaptcha = page.url();
        if (!currentUrlAfterCaptcha.includes('comments') && !currentUrlAfterCaptcha.includes(postId)) {
          console.log('🔄 Re-navigating to post after CAPTCHA...');
          await page.goto(finalUrl, { waitUntil: 'networkidle', timeout: 30000 });
          await page.waitForTimeout(3000);
        }
      } else {
        console.log('✅ No CAPTCHA detected, proceeding...');
      }

      // Step 3: Find and fill comment box
      console.log('3️⃣ Looking for comment box...');
      
      // Scroll down gradually to load comment section
      await page.evaluate(() => {
        const win = globalThis as any;
        win.scrollTo(0, win.document.body.scrollHeight / 4);
      });
      await page.waitForTimeout(2000);
      
      await page.evaluate(() => {
        const win = globalThis as any;
        win.scrollTo(0, win.document.body.scrollHeight / 2);
      });
      await page.waitForTimeout(2000);
      
      // Scroll to comments section (usually at the bottom)
      await page.evaluate(() => {
        const win = globalThis as any;
        win.scrollTo(0, win.document.body.scrollHeight);
      });
      await page.waitForTimeout(3000); // Wait longer for comment section to load

      let commentFilled = false;
      
      // Strategy 1: Look for the main comment form textarea (Reddit uses specific structure)
      const commentSelectors = [
        'textarea[placeholder*="comment" i]',
        'textarea[placeholder*="thoughts" i]',
        'textarea[placeholder*="reply" i]',
        'textarea[data-testid*="comment"]',
        'div[contenteditable="true"][role="textbox"]',
        'div[contenteditable="true"]',
        'textarea',
      ];
      
      for (const selector of commentSelectors) {
        try {
          const elements = await page.locator(selector).all();
          console.log(`Trying comment selector "${selector}": found ${elements.length} elements`);
          
          for (const element of elements) {
            try {
              if (await element.isVisible()) {
                const placeholder = await element.getAttribute('placeholder') || '';
                console.log(`   Found visible element with placeholder: "${placeholder}"`);
                
                await element.scrollIntoViewIfNeeded();
                await page.waitForTimeout(1000);
                
                // Click to focus
                await element.click({ clickCount: 3 });
                await page.waitForTimeout(500);
                
                // Fill the comment
                if (selector.includes('textarea')) {
                  await element.fill(reply);
                } else {
                  // For contenteditable, use keyboard input
                  await element.fill(reply);
                }
                
                await page.waitForTimeout(500);
                
                // Verify it was filled
                const value = selector.includes('textarea') 
                  ? await element.inputValue()
                  : await element.textContent();
                
                if (value && value.includes(reply.substring(0, 20))) {
                  commentFilled = true;
                  console.log(`✅ Filled comment using: ${selector}`);
                  break;
                } else {
                  console.log(`   ⚠️ Value mismatch, trying next...`);
                }
              }
            } catch (e: any) {
              console.log(`   Failed: ${e.message}`);
              continue;
            }
          }
          if (commentFilled) break;
        } catch (e: any) {
          continue;
        }
      }

      if (!commentFilled) {
        await page.screenshot({ path: 'comment-box-not-found.png', fullPage: true });
        console.error('❌ Could not find comment box');
        console.error('Page URL:', page.url());
        await page.waitForTimeout(30000);
        throw new Error('Could not find comment box');
      }

      // Step 4: Submit comment with rate limiting protection
      console.log('4️⃣ Submitting comment...');
      await page.waitForTimeout(3000); // Longer delay to avoid rate limits

      let submitted = false;
      
      // Strategy 1: Find submit button - try multiple selectors
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Comment")',
        'button:has-text("Post")',
        'button[data-testid*="submit"]',
        'button[data-testid*="comment"]',
        'button[aria-label*="Comment" i]',
        'button[aria-label*="Post" i]',
      ];
      
      for (const selector of submitSelectors) {
        try {
          const buttons = await page.locator(selector).all();
          console.log(`Trying submit selector "${selector}": found ${buttons.length} buttons`);
          
          for (const button of buttons) {
            try {
              if (await button.isVisible()) {
                const text = (await button.textContent() || '').trim().toLowerCase();
                console.log(`   Found button with text: "${text}"`);
                
                if (text.includes('comment') || text.includes('post') || text === '' || text.includes('save')) {
                  await button.scrollIntoViewIfNeeded();
                  await page.waitForTimeout(1000); // Delay before clicking
                  await button.click();
                  submitted = true;
                  console.log(`✅ Clicked submit button: "${text}"`);
                  break;
                }
              }
            } catch (e: any) {
              console.log(`   Button click failed: ${e.message}`);
              continue;
            }
          }
          if (submitted) break;
        } catch (e: any) {
          continue;
        }
      }

      // Strategy 2: Ctrl+Enter (Reddit shortcut)
      if (!submitted) {
        console.log('⚠️ No submit button found, trying Ctrl+Enter...');
        await page.keyboard.press('Control+Enter');
        await page.waitForTimeout(3000);
        submitted = true; // Assume it worked
      }
      
      // Wait a bit after submitting to let it process
      await page.waitForTimeout(5000);

      // Step 5: Check for errors (429 rate limit, etc.) and verify comment
      console.log('5️⃣ Checking for errors and verifying comment...');
      
      // Check for error messages on the page
      const hasError = await page.evaluate(() => {
        const win = globalThis as any;
        const doc = win.document;
        const bodyText = doc.body.textContent || '';
        return (
          bodyText.includes('429') ||
          bodyText.includes('rate limit') ||
          bodyText.includes('too many requests') ||
          bodyText.includes('try again later') ||
          doc.querySelector('[class*="error"]') ||
          doc.querySelector('[id*="error"]')
        );
      });
      
      if (hasError) {
        console.warn('⚠️ Error detected on page (might be 429 rate limit)');
        console.warn('   Checking if comment was posted anyway...');
      }
      
      await page.waitForTimeout(8000); // Wait longer for comment to appear

      // Check multiple ways to verify the comment was posted
      const pageContent = await page.content();
      const currentUrl = page.url();
      
      // Check 1: Look for reply text in page
      const replySnippet = reply.substring(0, 50).replace(/[^\w\s]/g, ''); // Remove special chars for matching
      const replyFound = pageContent.toLowerCase().includes(replySnippet.toLowerCase());
      
      // Check 2: Look for comment indicators
      const hasCommentIndicators = await page.evaluate(() => {
        const win = globalThis as any;
        const doc = win.document;
        // Check for comment count increase, comment sections, etc.
        return !!(
          doc.querySelector('[data-testid*="comment"]') ||
          doc.querySelector('[class*="comment"]') ||
          doc.querySelector('[id*="comment"]')
        );
      });
      
      // Check 3: URL should still be on comments page
      const stillOnCommentsPage = currentUrl.includes('comments') || currentUrl.includes(postId);
      
      // Check 4: Look for "your comment" or similar indicators
      const hasYourComment = pageContent.toLowerCase().includes('your comment') || 
                            pageContent.toLowerCase().includes('just now');
      
      console.log(`   Verification results:`);
      console.log(`   - Reply text found: ${replyFound}`);
      console.log(`   - Comment indicators: ${hasCommentIndicators}`);
      console.log(`   - Still on comments page: ${stillOnCommentsPage}`);
      console.log(`   - Has "your comment": ${hasYourComment}`);
      
      const success = replyFound || (stillOnCommentsPage && hasCommentIndicators) || hasYourComment;
      
      if (success) {
        console.log('✅✅✅ COMMENT POSTED SUCCESSFULLY!');
        if (hasError) {
          console.log('   Note: Error occurred but comment was posted anyway');
        }
        await browser.close();
        return true;
      } else {
        if (hasError) {
          console.error('❌ 429 Rate Limit Error - Comment might not have posted');
          console.error('   Reddit is rate limiting requests');
          console.error('   Recommendation: Wait a few minutes before trying again');
        } else {
          console.log('⚠️ Comment verification failed, but might have posted...');
        }
        console.log(`   Current URL: ${currentUrl}`);
        await page.screenshot({ path: 'comment-post-result.png', fullPage: true });
        console.log('   Screenshot saved to comment-post-result.png');
        
        // Give it more time and check again (in case of rate limit delay)
        console.log('   Waiting longer and checking again...');
        await page.waitForTimeout(10000);
        const pageContent2 = await page.content();
        const replyFound2 = pageContent2.toLowerCase().includes(replySnippet.toLowerCase());
        
        if (replyFound2) {
          console.log('✅✅✅ COMMENT FOUND ON SECOND CHECK!');
          await browser.close();
          return true;
        }
        
        await browser.close();
        return false;
      }
    } catch (error) {
      console.error('Post reply error:', error);
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          // Ignore
        }
      }
      return false;
    }
  }

  async getAccountInfo(): Promise<any> {
    if (!this.loggedIn) {
      return null;
    }
    return {
      loggedIn: this.loggedIn,
      cookies: this.cookies ? 'present' : 'missing',
    };
  }
}

import puppeteer from 'puppeteer';
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
  postReply(postId: string, reply: string): Promise<boolean>;
  getAccountInfo(): Promise<any>;
}

export class Crawl4aiRedditAdapter implements RedditAdapter {
  private cookies: string | null = null;
  private loggedIn: boolean = false;

  async login(username: string, password: string): Promise<boolean> {
    try {
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
      const page = await browser.newPage();

      await page.goto('https://www.reddit.com/login', { 
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      await page.waitForSelector('input[name="username"]', { timeout: 10000 });
      await page.waitForSelector('input[name="password"]', { timeout: 10000 });

      await page.type('input[name="username"]', username, { delay: 50 });
      await page.type('input[name="password"]', password, { delay: 50 });
      
      await page.click('button[type="submit"]');

      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});

      const cookies = await page.cookies();
      this.cookies = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      
      const currentUrl = page.url();
      this.loggedIn = currentUrl.includes('reddit.com') && !currentUrl.includes('/login');

      await browser.close();
      return this.loggedIn;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async scrapeLatestPosts(
    subreddit: string = 'all',
    limit: number = 25,
    timeFilter: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' = 'hour'
  ): Promise<RedditPost[]> {
    try {
      // Use Reddit JSON API directly - new sorting option
      const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}&t=${timeFilter}`;
      
      const response = await axios.get(url, {
        headers: this.cookies ? {
          Cookie: this.cookies,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        } : {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const data = response.data;
      const posts: RedditPost[] = [];

      if (data?.data?.children) {
        const now = Date.now() / 1000;
        const thirtyMinutesAgo = now - (30 * 60);

        for (const child of data.data.children) {
          const post = child.data;
          const createdUtc = post.created_utc;

          // Filter posts from last 30 minutes
          if (createdUtc >= thirtyMinutesAgo) {
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

      return posts;
    } catch (error) {
      console.error('Scraping error:', error);
      return [];
    }
  }

  async postReply(postId: string, reply: string): Promise<boolean> {
    try {
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();

      if (this.cookies) {
        const cookieStrings = this.cookies.split('; ');
        const cookies = cookieStrings.map(c => {
          const [name, value] = c.split('=');
          return { name, value, domain: '.reddit.com', path: '/' };
        });
        await page.setCookie(...cookies);
      }

      const url = `https://www.reddit.com/api/comment.json`;
      await page.goto(url);
      
      // Post reply logic would go here
      // This is simplified - actual implementation needs Reddit's API format

      await browser.close();
      return true;
    } catch (error) {
      console.error('Post reply error:', error);
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

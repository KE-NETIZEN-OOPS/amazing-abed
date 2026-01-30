import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Crawl4aiRedditAdapter } from '@amazing-abed/reddit-adapter';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ScrapingService {
  private adapters: Map<string, Crawl4aiRedditAdapter> = new Map();
  private activeScrapes: Map<string, { interval: NodeJS.Timeout; startTime: number; postsFound: number }> = new Map();

  constructor(
    private prisma: PrismaService,
    @InjectQueue('scraping') private scrapingQueue: Queue,
    @InjectQueue('processing') private processingQueue: Queue,
    private eventEmitter: EventEmitter2,
  ) {}

  async startScraping(accountId: string) {
    try {
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
        include: { sessions: { orderBy: { createdAt: 'desc' }, take: 1 } },
      });

      if (!account) {
        throw new Error('Account not found');
      }

      if (account.status !== 'ACTIVE') {
        throw new Error('Account is not active');
      }

      // Stop existing scrape if running
      this.stopScraping(accountId);

      // Create adapter instance
      const adapter = new Crawl4aiRedditAdapter();
      this.adapters.set(accountId, adapter);

      // Try to use saved session first
      if (account.sessions && account.sessions.length > 0) {
        const session = account.sessions[0];
        const { CookieVault } = require('@amazing-abed/auth');
        const vault = new CookieVault();
        try {
          const cookies = vault.decrypt(session.cookies);
          adapter.setCookies(cookies);
          console.log(`✅ Using saved session for ${account.username}`);
        } catch (e) {
          console.log(`⚠️ Could not decrypt session, will login fresh`);
        }
      }

      // Login if no valid session
      if (!adapter.getCookies()) {
        console.log(`Logging in to Reddit as ${account.username}...`);
        const loggedIn = await adapter.login(account.username, account.password);
        if (!loggedIn) {
          throw new Error('Failed to login to Reddit');
        }
      }

      // Start scraping cycle: 5 minutes scrape, 2 minutes break
      this.runScrapingCycle(accountId, adapter);
      
      // Update account status
      await this.prisma.account.update({
        where: { id: accountId },
        data: { lastActive: new Date() },
      });
    } catch (error: any) {
      console.error('Error starting scraping:', error);
      throw error;
    }
  }

  private async runScrapingCycle(accountId: string, adapter: Crawl4aiRedditAdapter) {
    const startTime = Date.now();
    const scrapeDuration = 30 * 60 * 1000; // 30 minutes
    const breakDuration = 5 * 60 * 1000; // 5 minutes
    let postsFound = 0;

    const scrapeInterval = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      const remaining = scrapeDuration - elapsed;

      if (remaining <= 0) {
        clearInterval(scrapeInterval);
        const scrapeData = this.activeScrapes.get(accountId);
        if (scrapeData) {
          this.activeScrapes.delete(accountId);
        }

        // Emit progress update
        this.eventEmitter.emit('scrape.progress', {
          accountId,
          status: 'break',
          postsFound,
          timeRemaining: breakDuration,
        });

        // Wait for break, then continue
        setTimeout(() => {
          this.runScrapingCycle(accountId, adapter);
        }, breakDuration);

        return;
      }

      try {
        // Scrape from specific NSFW/rating subreddits first, then 'all'
        const posts = await adapter.scrapeLatestPosts('all', 100, 'hour');

        for (const post of posts) {
          // Check if already exists
          const existing = await this.prisma.content.findUnique({
            where: { redditId: post.id },
          });

          if (!existing) {
            // Filter by keywords - prioritize "dickrating" specifically
            const text = `${post.title} ${post.body || ''}`.toLowerCase();
            
            // Primary keywords for dickrating
            const primaryKeywords = [
              'dickrating', 'dick rating', 'dickrate', 'rate my dick', 'rate my cock',
              'dick rate', 'cock rating', 'penis rating', 'rate my penis'
            ];
            
            // Secondary keywords
            const secondaryKeywords = [
              'rate me', 'rating', 'rate', 'nsfw', 'onlyfans', 'of', 'custom',
              'dm me', 'pm me', 'kik', 'snap', 'snapchat', 'selling content'
            ];
            
            const hasPrimaryKeyword = primaryKeywords.some(kw => text.includes(kw));
            const hasSecondaryKeyword = secondaryKeywords.some(kw => text.includes(kw));
            
            // Relevant NSFW subreddits
            const nsfwSubreddits = [
              'rateme', 'amiugly', 'freecompliments', 'roastme', 'truerateme',
              'nsfw', 'gonewild', 'realgirls', 'amihot', 'ratemyboobs', 'ratemypussy',
              'dick', 'cock', 'penis', 'rate', 'rating', 'ratemy', 'ratemydick',
              'onlyfans', 'nsfw411', 'nsfw_gifs', 'nsfw_videos'
            ];
            const subredditLower = post.subreddit.toLowerCase();
            const isNsfwSubreddit = nsfwSubreddits.some(sub => subredditLower.includes(sub));
            
            // Accept if: has primary keyword OR (NSFW + has secondary keyword) OR NSFW subreddit
            const isRelevant = hasPrimaryKeyword || (post.isNsfw && hasSecondaryKeyword) || (post.isNsfw && isNsfwSubreddit) || isNsfwSubreddit;

            if (!isRelevant) {
              continue; // Skip irrelevant posts
            }
            
            const keywordType = hasPrimaryKeyword ? 'PRIMARY' : hasSecondaryKeyword ? 'SECONDARY' : 'NSFW_SUBREDDIT';
            console.log(`✅ Found relevant post: ${post.title.substring(0, 50)}... (NSFW: ${post.isNsfw}, Keyword: ${keywordType}, Sub: r/${post.subreddit})`);

            // Create content record
            const content = await this.prisma.content.create({
              data: {
                accountId,
                redditId: post.id,
                subreddit: post.subreddit,
                title: post.title,
                body: post.body,
                author: post.author,
                url: post.url,
                mediaPresent: post.mediaPresent,
                rawData: post as any,
              },
            });

            // Send to processing queue immediately (streaming - don't wait)
            this.processingQueue.add('process-content', {
              contentId: content.id,
              accountId,
            }).catch(err => console.error('Queue error:', err));

            postsFound++;
          }
        }

        // Update active scrape data
        this.activeScrapes.set(accountId, {
          interval: scrapeInterval,
          startTime,
          postsFound,
        });

        // Emit progress update
        this.eventEmitter.emit('scrape.progress', {
          accountId,
          status: 'scraping',
          postsFound,
          timeRemaining: remaining,
        });
      } catch (error) {
        console.error(`Scraping error for account ${accountId}:`, error);
      }
    }, 10000); // Check every 10 seconds

    this.activeScrapes.set(accountId, {
      interval: scrapeInterval,
      startTime,
      postsFound: 0,
    });
  }

  async stopScraping(accountId: string) {
    const scrapeData = this.activeScrapes.get(accountId);
    if (scrapeData) {
      clearInterval(scrapeData.interval);
      this.activeScrapes.delete(accountId);
    }
    this.adapters.delete(accountId);
  }

  async getScrapingStatus(accountId: string): Promise<{
    active: boolean;
    postsFound?: number;
    timeRemaining?: number;
    status?: 'scraping' | 'break';
    startTime?: number;
  }> {
    const scrapeData = this.activeScrapes.get(accountId);
    if (!scrapeData) {
      return { active: false };
    }
    
    const elapsed = Date.now() - scrapeData.startTime;
    const scrapeDuration = 30 * 60 * 1000; // 30 minutes
    const remaining = scrapeDuration - elapsed;
    const isBreak = remaining <= 0;
    
    return {
      active: true,
      postsFound: scrapeData.postsFound || 0,
      timeRemaining: isBreak ? 5 * 60 * 1000 : Math.max(0, remaining), // 5 min break or remaining scrape time
      status: isBreak ? 'break' : 'scraping',
      startTime: scrapeData.startTime,
    };
  }
}

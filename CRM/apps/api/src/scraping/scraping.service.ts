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
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: { sessions: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!account || account.status !== 'ACTIVE') {
      throw new Error('Account not found or inactive');
    }

    // Stop existing scrape if running
    this.stopScraping(accountId);

    // Create adapter instance
    const adapter = new Crawl4aiRedditAdapter();
    this.adapters.set(accountId, adapter);

    // Login
    const loggedIn = await adapter.login(account.username, account.password);
    if (!loggedIn) {
      throw new Error('Failed to login to Reddit');
    }

    // Start scraping cycle: 5 minutes scrape, 2 minutes break
    this.runScrapingCycle(accountId, adapter);
  }

  private async runScrapingCycle(accountId: string, adapter: Crawl4aiRedditAdapter) {
    const startTime = Date.now();
    const scrapeDuration = 5 * 60 * 1000; // 5 minutes
    const breakDuration = 2 * 60 * 1000; // 2 minutes
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
        // Scrape latest posts (last 30 minutes) - use 'new' sorting
        const posts = await adapter.scrapeLatestPosts('all', 100, 'hour');

        for (const post of posts) {
          // Check if already exists
          const existing = await this.prisma.content.findUnique({
            where: { redditId: post.id },
          });

          if (!existing) {
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

  async getScrapingStatus(accountId: string) {
    const scrapeData = this.activeScrapes.get(accountId);
    return {
      active: !!scrapeData,
      accountId,
      postsFound: scrapeData?.postsFound || 0,
      timeRemaining: scrapeData ? (5 * 60 * 1000) - (Date.now() - scrapeData.startTime) : 0,
    };
  }
}

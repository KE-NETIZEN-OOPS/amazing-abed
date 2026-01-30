import { Controller, Post, Get, Delete, Param, Sse } from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';

@Controller('scraping')
export class ScrapingController {
  constructor(
    private scrapingService: ScrapingService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Post('start/:accountId')
  async startScraping(@Param('accountId') accountId: string) {
    try {
      await this.scrapingService.startScraping(accountId);
      return { success: true, accountId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Delete('stop/:accountId')
  async stopScraping(@Param('accountId') accountId: string) {
    try {
      await this.scrapingService.stopScraping(accountId);
      return { success: true, accountId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('status/:accountId')
  async getStatus(@Param('accountId') accountId: string) {
    try {
      return this.scrapingService.getScrapingStatus(accountId);
    } catch (error) {
      return { active: false, error: error.message };
    }
  }

  @Sse('progress/:accountId')
  progress(@Param('accountId') accountId: string): Observable<MessageEvent> {
    return new Observable((observer) => {
      const handler = (data: any) => {
        if (data.accountId === accountId) {
          observer.next({
            data: JSON.stringify(data),
          } as MessageEvent);
        }
      };

      this.eventEmitter.on('scrape.progress', handler);

      return () => {
        this.eventEmitter.off('scrape.progress', handler);
      };
    });
  }
}

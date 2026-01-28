import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScrapingController } from './scraping.controller';
import { ScrapingService } from './scraping.service';
import { ScrapingProcessor } from './scraping.processor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'scraping',
    }),
    BullModule.registerQueue({
      name: 'processing',
    }),
  ],
  controllers: [ScrapingController],
  providers: [ScrapingService, ScrapingProcessor],
  exports: [ScrapingService],
})
export class ScrapingModule {}

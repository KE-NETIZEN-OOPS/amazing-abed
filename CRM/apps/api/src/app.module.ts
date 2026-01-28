import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AccountsModule } from './accounts/accounts.module';
import { ContentModule } from './content/content.module';
import { ScrapingModule } from './scraping/scraping.module';
import { DraftsModule } from './drafts/drafts.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    AccountsModule,
    ContentModule,
    ScrapingModule,
    DraftsModule,
    DashboardModule,
  ],
})
export class AppModule {}

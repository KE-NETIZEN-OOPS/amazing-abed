import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('scraping')
export class ScrapingProcessor extends WorkerHost {
  async process(job: Job) {
    console.log(`Processing scraping job ${job.id}`);
    return { success: true };
  }
}

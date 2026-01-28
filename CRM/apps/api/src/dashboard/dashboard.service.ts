import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [accounts, activeScrapes, postsFound, draftsGenerated] = await Promise.all([
      this.prisma.account.count(),
      this.prisma.account.count({ where: { status: 'ACTIVE' } }),
      this.prisma.content.count(),
      this.prisma.draft.count({ where: { approved: false } }),
    ]);

    return {
      accounts,
      activeScrapes,
      postsFound,
      draftsGenerated,
    };
  }
}

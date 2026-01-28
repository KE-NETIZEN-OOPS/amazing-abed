import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DraftsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.draft.findMany({
      orderBy: { createdAt: 'desc' },
      include: { content: true },
    });
  }
}

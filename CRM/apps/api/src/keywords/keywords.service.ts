import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KeywordsService {
  constructor(private prisma: PrismaService) {}

  async findByAccount(accountId: string) {
    return this.prisma.keyword.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(accountId: string, baseTerm: string, variants: string[] = []) {
    return this.prisma.keyword.create({
      data: {
        accountId,
        baseTerm,
        variants: variants.length > 0 ? variants : [baseTerm],
      },
    });
  }

  async update(id: string, baseTerm: string, variants: string[]) {
    return this.prisma.keyword.update({
      where: { id },
      data: {
        baseTerm,
        variants,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.keyword.delete({
      where: { id },
    });
  }
}

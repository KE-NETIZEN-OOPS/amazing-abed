import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.account.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    username: string;
    password: string;
    type: 'SCRAPE' | 'POST' | 'BOTH';
  }) {
    return this.prisma.account.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.account.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.account.delete({
      where: { id },
    });
  }
}

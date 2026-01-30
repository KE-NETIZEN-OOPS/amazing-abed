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
    // Trim username to prevent duplicates with spaces
    const trimmedUsername = data.username.trim();
    
    // Check if account already exists
    const existing = await this.prisma.account.findUnique({
      where: { username: trimmedUsername },
    });
    
    if (existing) {
      throw new Error(`Account with username "${trimmedUsername}" already exists`);
    }
    
    return this.prisma.account.create({
      data: {
        ...data,
        username: trimmedUsername,
      },
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

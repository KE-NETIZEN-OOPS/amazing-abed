import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

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
    
    try {
      return await this.prisma.account.create({
        data: {
          ...data,
          username: trimmedUsername,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Handle concurrent duplicate creates gracefully to avoid unstable client behavior.
        const existing = await this.prisma.account.findUnique({
          where: { username: trimmedUsername },
        });
        if (existing) {
          throw new Error(`Account with username "${trimmedUsername}" already exists`);
        }
      }
      throw error;
    }
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

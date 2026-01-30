import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CookieVault } from '@amazing-abed/auth';

@Injectable()
export class SessionsService {
  private cookieVault = new CookieVault();

  async getValidSession(accountId: string): Promise<string | null> {
    const session = await this.prisma.session.findFirst({
      where: {
        accountId,
        expiry: {
          gt: new Date(), // Not expired
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!session) {
      return null;
    }

    try {
      // Decrypt cookies
      const cookies = this.cookieVault.decrypt(session.cookies);
      return cookies;
    } catch (error) {
      console.error('Error decrypting session cookies:', error);
      return null;
    }
  }

  async saveSession(accountId: string, cookies: string, expiryHours: number = 24): Promise<void> {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + expiryHours);

    const renewalAt = new Date();
    renewalAt.setHours(renewalAt.getHours() + expiryHours - 2); // Renew 2 hours before expiry

    // Encrypt cookies
    const encryptedCookies = this.cookieVault.encrypt(cookies);

    // Delete old sessions for this account
    await this.prisma.session.deleteMany({
      where: { accountId },
    });

    // Create new session
    await this.prisma.session.create({
      data: {
        accountId,
        cookies: encryptedCookies,
        expiry,
        renewalAt,
      },
    });

    console.log(`✅ Saved session for account ${accountId}, expires at ${expiry}`);
  }

  async deleteSession(accountId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { accountId },
    });
  }

  constructor(private prisma: PrismaService) {}
}

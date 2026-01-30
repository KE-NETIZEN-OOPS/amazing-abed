const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amazing_abed',
    },
  },
});

async function checkAccounts() {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    console.log(`\n📊 Found ${accounts.length} accounts:\n`);
    accounts.forEach((acc, index) => {
      console.log(`${index + 1}. ID: ${acc.id}`);
      console.log(`   Username: "${acc.username}" (length: ${acc.username.length})`);
      console.log(`   Type: ${acc.type}`);
      console.log(`   Status: ${acc.status}`);
      console.log(`   Created: ${acc.createdAt.toISOString()}`);
      console.log(`   Password: ${acc.password ? '***' + acc.password.slice(-4) : 'MISSING'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAccounts();

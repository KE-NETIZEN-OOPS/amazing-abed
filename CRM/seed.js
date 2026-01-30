const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create default account with provided credentials
  const account = await prisma.account.upsert({
    where: { username: 'WonderfulBook9970' },
    update: {},
    create: {
      username: 'WonderfulBook9970',
      password: 'Kenya254@_', // In production, this should be encrypted
      type: 'BOTH',
      status: 'ACTIVE',
    },
  });

  // Create some default keywords
  await prisma.keyword.createMany({
    data: [
      { baseTerm: 'dickrating', variants: ['dickrating', 'dick rating', 'rate', 'rating'] },
      { baseTerm: 'rate', variants: ['rate', 'rating', 'rated'] },
      { baseTerm: 'nsfw', variants: ['nsfw', 'onlyfans'] },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed data created:', account);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

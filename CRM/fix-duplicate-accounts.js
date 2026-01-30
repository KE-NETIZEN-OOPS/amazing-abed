const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amazing_abed',
    },
  },
});

async function fixAccounts() {
  try {
    // Get all accounts
    const accounts = await prisma.account.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    console.log(`Found ${accounts.length} accounts\n`);
    
    // Group accounts by trimmed username
    const accountGroups = new Map();
    for (const account of accounts) {
      const trimmedUsername = account.username.trim();
      if (!accountGroups.has(trimmedUsername)) {
        accountGroups.set(trimmedUsername, []);
      }
      accountGroups.get(trimmedUsername).push(account);
    }
    
    // Process each group
    for (const [trimmedUsername, groupAccounts] of accountGroups.entries()) {
      if (groupAccounts.length > 1) {
        // Multiple accounts with same username - keep the oldest, delete others
        console.log(`❌ Found ${groupAccounts.length} accounts with username "${trimmedUsername}"`);
        
        // Sort by creation date (oldest first)
        groupAccounts.sort((a, b) => a.createdAt - b.createdAt);
        
        // Keep the first (oldest), delete the rest
        const toKeep = groupAccounts[0];
        const toDelete = groupAccounts.slice(1);
        
        console.log(`   Keeping: ${toKeep.id} (created: ${toKeep.createdAt.toISOString()})`);
        
        for (const account of toDelete) {
          console.log(`   Deleting: ${account.id} (created: ${account.createdAt.toISOString()})`);
          await prisma.account.delete({
            where: { id: account.id },
          });
        }
        console.log(`✅ Deleted ${toDelete.length} duplicate account(s)\n`);
        
        // Fix username if it has leading/trailing spaces
        if (toKeep.username !== trimmedUsername) {
          console.log(`🔧 Fixing username: "${toKeep.username}" -> "${trimmedUsername}"`);
          await prisma.account.update({
            where: { id: toKeep.id },
            data: { username: trimmedUsername },
          });
          console.log(`✅ Fixed username\n`);
        }
      } else {
        // Single account - just fix username if needed
        const account = groupAccounts[0];
        if (account.username !== trimmedUsername) {
          console.log(`🔧 Fixing username: "${account.username}" -> "${trimmedUsername}"`);
          await prisma.account.update({
            where: { id: account.id },
            data: { username: trimmedUsername },
          });
          console.log(`✅ Fixed username\n`);
        }
      }
    }
    
    // Show final accounts
    const finalAccounts = await prisma.account.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    console.log(`\n📊 Final accounts (${finalAccounts.length}):\n`);
    finalAccounts.forEach((acc, index) => {
      console.log(`${index + 1}. ${acc.username} (${acc.type}, ${acc.status})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAccounts();

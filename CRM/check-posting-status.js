const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amazing_abed',
    },
  },
});

async function checkStatus() {
  try {
    console.log('🔍 Checking posting status...\n');

    // Check accounts
    const accounts = await prisma.account.findMany();
    console.log(`📊 Accounts: ${accounts.length}`);
    accounts.forEach(acc => {
      console.log(`  - ${acc.username} (${acc.type}, ${acc.status})`);
    });

    // Check sessions
    const sessions = await prisma.session.findMany({
      include: { account: true },
    });
    console.log(`\n🔐 Sessions: ${sessions.length}`);
    sessions.forEach(session => {
      const isExpired = session.expiry < new Date();
      console.log(`  - Account: ${session.account.username}`);
      console.log(`    Expires: ${session.expiry.toISOString()} ${isExpired ? '❌ EXPIRED' : '✅ Valid'}`);
      console.log(`    Renewal: ${session.renewalAt.toISOString()}`);
    });

    // Check drafts
    const drafts = await prisma.draft.findMany({
      include: { 
        account: true,
        content: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    console.log(`\n📝 Recent Drafts: ${drafts.length}`);
    drafts.forEach(draft => {
      console.log(`  - Draft ID: ${draft.id}`);
      console.log(`    Account: ${draft.account.username}`);
      console.log(`    Content: ${draft.content.title.substring(0, 50)}...`);
      console.log(`    Approved: ${draft.approved ? '✅' : '❌'}`);
      console.log(`    Created: ${draft.createdAt.toISOString()}`);
    });

    // Check posts
    const posts = await prisma.post.findMany({
      include: {
        account: true,
        draft: true,
      },
      orderBy: { postedAt: 'desc' },
      take: 10,
    });
    console.log(`\n📮 Recent Posts: ${posts.length}`);
    posts.forEach(post => {
      console.log(`  - Post ID: ${post.id}`);
      console.log(`    Account: ${post.account.username}`);
      console.log(`    Reddit ID: ${post.redditId || 'N/A'}`);
      console.log(`    Success: ${post.success ? '✅' : '❌'}`);
      if (!post.success && post.error) {
        console.log(`    Error: ${post.error.substring(0, 100)}...`);
      }
      console.log(`    Posted At: ${post.postedAt.toISOString()}`);
    });

    // Check content status
    const contentStats = await prisma.content.groupBy({
      by: ['status'],
      _count: true,
    });
    console.log(`\n📊 Content Status:`);
    contentStats.forEach(stat => {
      console.log(`  - ${stat.status}: ${stat._count}`);
    });

    console.log('\n✅ Status check complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();

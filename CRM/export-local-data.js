const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:postgres@localhost:5432/amazing_abed',
    },
  },
});

async function exportData() {
  try {
    console.log('📦 Exporting data from local database...');
    
    const accounts = await prisma.account.findMany();
    const sessions = await prisma.session.findMany();
    const keywords = await prisma.keyword.findMany();
    const content = await prisma.content.findMany();
    const drafts = await prisma.draft.findMany();
    const posts = await prisma.post.findMany();
    const events = await prisma.event.findMany();
    const contentKeywords = await prisma.contentKeyword.findMany();
    
    const data = {
      accounts,
      sessions,
      keywords,
      content,
      drafts,
      posts,
      events,
      contentKeywords,
    };
    
    console.log(`✅ Exported:`);
    console.log(`   Accounts: ${accounts.length}`);
    console.log(`   Sessions: ${sessions.length}`);
    console.log(`   Keywords: ${keywords.length}`);
    console.log(`   Content: ${content.length}`);
    console.log(`   Drafts: ${drafts.length}`);
    console.log(`   Posts: ${posts.length}`);
    console.log(`   Events: ${events.length}`);
    console.log(`   ContentKeywords: ${contentKeywords.length}`);
    
    require('fs').writeFileSync('local-data-export.json', JSON.stringify(data, null, 2));
    console.log('\n✅ Data exported to local-data-export.json');
    
  } catch (error) {
    console.error('❌ Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();

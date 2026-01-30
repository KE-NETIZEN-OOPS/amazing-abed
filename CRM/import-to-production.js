const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amazing_abed',
    },
  },
});

async function importData() {
  try {
    console.log('📥 Importing data to production database...');
    
    if (!fs.existsSync('local-data-export.json')) {
      console.error('❌ local-data-export.json not found!');
      process.exit(1);
    }
    
    const data = JSON.parse(fs.readFileSync('local-data-export.json', 'utf8'));
    
    // Import in order (respecting foreign keys)
    if (data.accounts && data.accounts.length > 0) {
      console.log(`\n📝 Importing ${data.accounts.length} accounts...`);
      for (const account of data.accounts) {
        await prisma.account.upsert({
          where: { username: account.username },
          update: account,
          create: account,
        });
      }
      console.log('✅ Accounts imported');
    }
    
    if (data.keywords && data.keywords.length > 0) {
      console.log(`\n📝 Importing ${data.keywords.length} keywords...`);
      for (const keyword of data.keywords) {
        await prisma.keyword.upsert({
          where: { id: keyword.id },
          update: keyword,
          create: keyword,
        });
      }
      console.log('✅ Keywords imported');
    }
    
    if (data.content && data.content.length > 0) {
      console.log(`\n📝 Importing ${data.content.length} content items...`);
      for (const item of data.content) {
        await prisma.content.upsert({
          where: { redditId: item.redditId },
          update: item,
          create: item,
        });
      }
      console.log('✅ Content imported');
    }
    
    if (data.sessions && data.sessions.length > 0) {
      console.log(`\n📝 Importing ${data.sessions.length} sessions...`);
      for (const session of data.sessions) {
        await prisma.session.upsert({
          where: { id: session.id },
          update: session,
          create: session,
        });
      }
      console.log('✅ Sessions imported');
    }
    
    if (data.drafts && data.drafts.length > 0) {
      console.log(`\n📝 Importing ${data.drafts.length} drafts...`);
      for (const draft of data.drafts) {
        await prisma.draft.upsert({
          where: { id: draft.id },
          update: draft,
          create: draft,
        });
      }
      console.log('✅ Drafts imported');
    }
    
    if (data.posts && data.posts.length > 0) {
      console.log(`\n📝 Importing ${data.posts.length} posts...`);
      for (const post of data.posts) {
        await prisma.post.upsert({
          where: { id: post.id },
          update: post,
          create: post,
        });
      }
      console.log('✅ Posts imported');
    }
    
    if (data.events && data.events.length > 0) {
      console.log(`\n📝 Importing ${data.events.length} events...`);
      for (const event of data.events) {
        await prisma.event.upsert({
          where: { id: event.id },
          update: event,
          create: event,
        });
      }
      console.log('✅ Events imported');
    }
    
    if (data.contentKeywords && data.contentKeywords.length > 0) {
      console.log(`\n📝 Importing ${data.contentKeywords.length} content-keyword relations...`);
      for (const ck of data.contentKeywords) {
        await prisma.contentKeyword.upsert({
          where: {
            contentId_keywordId: {
              contentId: ck.contentId,
              keywordId: ck.keywordId,
            },
          },
          update: ck,
          create: ck,
        });
      }
      console.log('✅ ContentKeywords imported');
    }
    
    console.log('\n🎉 All data imported successfully!');
    
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importData();

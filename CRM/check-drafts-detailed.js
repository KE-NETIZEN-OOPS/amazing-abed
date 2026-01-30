const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amazing_abed',
    },
  },
});

async function checkDrafts() {
  try {
    const drafts = await prisma.draft.findMany({
      include: {
        content: true,
        account: true,
        posts: {
          orderBy: { postedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    console.log(`📝 DRAFTS DETAILED CHECK (${drafts.length} total)\n`);
    
    drafts.forEach((draft, i) => {
      console.log(`${i + 1}. Draft ${draft.id.substring(0, 12)}...`);
      console.log(`   Account: ${draft.account.username}`);
      console.log(`   Approved: ${draft.approved ? '✅' : '❌'}`);
      console.log(`   Status: ${draft.status || 'NOT SET'}`);
      console.log(`   Title: ${draft.content.title?.substring(0, 50)}`);
      console.log(`   Reddit ID: ${draft.content.redditId}`);
      
      if (draft.posts && draft.posts.length > 0) {
        const latestPost = draft.posts[0];
        console.log(`   Latest Post:`);
        console.log(`     Success: ${latestPost.success ? '✅' : '❌'}`);
        console.log(`     Posted: ${latestPost.postedAt.toISOString()}`);
        if (latestPost.error) {
          console.log(`     Error: ${latestPost.error.substring(0, 100)}`);
        }
        
        // Check if status should be POSTED
        if (latestPost.success && draft.status !== 'POSTED') {
          console.log(`   ⚠️ MISMATCH: Post succeeded but draft status is ${draft.status}`);
        }
      } else {
        console.log(`   No posts yet`);
      }
      console.log('');
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkDrafts();

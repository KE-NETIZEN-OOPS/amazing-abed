const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amazing_abed',
    },
  },
});

async function checkRecentPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { postedAt: 'desc' },
      take: 3,
      include: {
        draft: {
          include: {
            content: true,
          },
        },
      },
    });
    
    console.log('📤 Recent Posts (Latest 3):\n');
    posts.forEach((post, i) => {
      console.log(`${i + 1}. Post ID: ${post.id.substring(0, 12)}...`);
      console.log(`   Success: ${post.success ? '✅ YES' : '❌ NO'}`);
      console.log(`   Posted: ${post.postedAt.toISOString()}`);
      if (post.error) {
        console.log(`   Error: ${post.error.substring(0, 200)}`);
      }
      if (post.draft?.content) {
        console.log(`   Draft Title: ${post.draft.content.title?.substring(0, 60)}`);
        console.log(`   Post URL: ${post.draft.content.url}`);
        console.log(`   Reddit ID: ${post.draft.content.redditId}`);
      }
      console.log('');
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkRecentPosts();

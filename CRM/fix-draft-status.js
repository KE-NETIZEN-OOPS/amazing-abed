const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amazing_abed',
    },
  },
});

async function fixDraftStatus() {
  console.log('🔧 Fixing Draft Status Mismatches\n');
  console.log('='.repeat(60));
  
  try {
    // Find all drafts with successful posts but status not POSTED
    const drafts = await prisma.draft.findMany({
      include: {
        posts: {
          where: { success: true },
          orderBy: { postedAt: 'desc' },
          take: 1,
        },
      },
    });
    
    let fixed = 0;
    
    for (const draft of drafts) {
      if (draft.posts.length > 0 && draft.status !== 'POSTED') {
        console.log(`\nFixing draft ${draft.id.substring(0, 12)}...`);
        console.log(`  Current status: ${draft.status}`);
        console.log(`  Has successful post: ✅`);
        console.log(`  Post date: ${draft.posts[0].postedAt.toISOString()}`);
        
        await prisma.draft.update({
          where: { id: draft.id },
          data: {
            status: 'POSTED',
            approved: true,
          },
        });
        
        console.log(`  ✅ Updated to POSTED`);
        fixed++;
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Fixed ${fixed} draft(s)`);
    
    // Show summary
    const summary = await prisma.draft.groupBy({
      by: ['status'],
      _count: true,
    });
    
    console.log('\n📊 Draft Status Summary:');
    summary.forEach(s => {
      console.log(`  ${s.status || 'NOT SET'}: ${s._count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDraftStatus();

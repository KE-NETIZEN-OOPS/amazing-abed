const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amazing_abed',
    },
  },
});

async function checkStatus() {
  console.log('🔍 System Status Check\n');
  console.log('='.repeat(60));
  
  try {
    // Check accounts
    console.log('\n📊 ACCOUNTS:');
    const accounts = await prisma.account.findMany();
    console.log(`   Total: ${accounts.length}`);
    accounts.forEach(a => {
      console.log(`   - ${a.username} (${a.status}, ${a.type})`);
    });
    
    // Check sessions
    console.log('\n🍪 SESSIONS:');
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: 'desc' },
    });
    console.log(`   Total: ${sessions.length}`);
    const now = new Date();
    sessions.forEach(s => {
      const expired = s.expiry < now;
      console.log(`   - Account: ${s.accountId}`);
      console.log(`     Created: ${s.createdAt.toISOString()}`);
      console.log(`     Expires: ${s.expiry.toISOString()} ${expired ? '❌ EXPIRED' : '✅ Valid'}`);
      console.log(`     Cookies: ${s.cookies.length} chars`);
    });
    
    // Check drafts
    console.log('\n📝 DRAFTS:');
    const drafts = await prisma.draft.findMany({
      include: {
        content: true,
        account: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    console.log(`   Total: ${drafts.length} (showing latest 5)`);
    drafts.forEach((d, i) => {
      console.log(`   ${i + 1}. Draft ${d.id.substring(0, 8)}...`);
      console.log(`      Account: ${d.account.username}`);
      console.log(`      Approved: ${d.approved ? '✅' : '❌'}`);
      console.log(`      Title: ${d.content.title?.substring(0, 50)}...`);
      console.log(`      URL: ${d.content.url || 'N/A'}`);
      console.log(`      Reddit ID: ${d.content.redditId || 'N/A'}`);
    });
    
    // Check posts
    console.log('\n📤 POSTS:');
    const posts = await prisma.post.findMany({
      orderBy: { postedAt: 'desc' },
      take: 5,
    });
    console.log(`   Total: ${posts.length} (showing latest 5)`);
    posts.forEach((p, i) => {
      console.log(`   ${i + 1}. Post ${p.id.substring(0, 8)}...`);
      console.log(`      Success: ${p.success ? '✅' : '❌'}`);
      console.log(`      Posted: ${p.postedAt.toISOString()}`);
      if (p.error) {
        console.log(`      Error: ${p.error.substring(0, 100)}...`);
      }
    });
    
    // Check for valid session for WonderfulBook9970
    console.log('\n🔐 SESSION CHECK FOR WonderfulBook9970:');
    const account = await prisma.account.findFirst({
      where: { username: 'WonderfulBook9970' },
    });
    
    if (account) {
      console.log(`   Account found: ${account.id}`);
      const validSession = await prisma.session.findFirst({
        where: {
          accountId: account.id,
          expiry: { gt: now },
        },
        orderBy: { createdAt: 'desc' },
      });
      
      if (validSession) {
        console.log(`   ✅ Valid session found!`);
        console.log(`      Expires: ${validSession.expiry.toISOString()}`);
        console.log(`      Cookies: ${validSession.cookies.length} chars`);
      } else {
        console.log(`   ❌ No valid session found`);
        const expiredSessions = await prisma.session.findMany({
          where: { accountId: account.id },
          orderBy: { createdAt: 'desc' },
        });
        if (expiredSessions.length > 0) {
          console.log(`   ⚠️ Found ${expiredSessions.length} expired session(s)`);
        }
      }
    } else {
      console.log(`   ❌ Account not found!`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Status check complete');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();

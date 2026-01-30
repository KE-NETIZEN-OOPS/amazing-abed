const { Crawl4aiRedditAdapter } = require('./packages/reddit-adapter/dist/index.js');
const { PrismaClient } = require('@prisma/client');
const { CookieVault } = require('./packages/auth/dist/index.js');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amazing_abed',
    },
  },
});

async function testLogin() {
  const username = 'WonderfulBook9970';
  const password = 'Kenya254@_';
  
  console.log('🧪 Testing Reddit Login Only\n');
  console.log('='.repeat(60));
  
  try {
    // Get account
    const account = await prisma.account.findFirst({
      where: { username: username.trim() },
    });
    
    if (!account) {
      console.error('❌ Account not found!');
      return;
    }
    console.log(`✅ Found account: ${account.username}\n`);
    
    // Create adapter
    const adapter = new Crawl4aiRedditAdapter();
    
    // Try login
    console.log('🔐 Attempting login...\n');
    const loggedIn = await adapter.login(username, password);
    
    if (loggedIn) {
      console.log('\n✅✅✅ LOGIN SUCCESSFUL!\n');
      
      // Get cookies
      const cookies = adapter.getCookies();
      if (cookies) {
        console.log(`🍪 Got ${cookies.split('; ').length} cookies`);
        console.log(`Cookie string length: ${cookies.length} chars\n`);
        
        // Save session
        const vault = new CookieVault();
        const encrypted = vault.encrypt(cookies);
        
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);
        
        // Delete old sessions
        await prisma.session.deleteMany({
          where: { accountId: account.id },
        });
        
        // Create new session
        await prisma.session.create({
          data: {
            accountId: account.id,
            cookies: encrypted,
            expiry,
            renewalAt: new Date(expiry.getTime() - 2 * 60 * 60 * 1000),
          },
        });
        
        console.log('✅ Session saved to database!');
        console.log(`   Expires at: ${expiry.toISOString()}\n`);
      }
    } else {
      console.log('\n❌ Login failed\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();

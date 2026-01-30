const { PrismaClient } = require('@prisma/client');
const { Crawl4aiRedditAdapter } = require('./packages/reddit-adapter/dist/index.js');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amazing_abed',
    },
  },
});

async function testFullFlow() {
  const username = 'WonderfulBook9970';
  const password = 'Kenya254@_';
  
  console.log('🧪 Testing Full Posting Flow\n');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Get account
    console.log('\n1️⃣ Getting account from database...');
    const account = await prisma.account.findFirst({
      where: { username: username.trim() },
    });
    
    if (!account) {
      console.error('❌ Account not found!');
      return;
    }
    console.log(`✅ Found account: ${account.username} (${account.id})`);
    
    // Step 2: Check for existing session
    console.log('\n2️⃣ Checking for saved session...');
    const session = await prisma.session.findFirst({
      where: {
        accountId: account.id,
        expiry: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    let adapter = new Crawl4aiRedditAdapter();
    
    if (session) {
      console.log('✅ Found valid session!');
      const { CookieVault } = require('./packages/auth/dist/index.js');
      const vault = new CookieVault();
      const cookies = vault.decrypt(session.cookies);
      adapter.setCookies(cookies);
      console.log(`✅ Loaded ${cookies.split('; ').length} cookies from session`);
    } else {
      console.log('⚠️ No valid session found, logging in...');
      const loggedIn = await adapter.login(username, password);
      if (!loggedIn) {
        console.error('❌ Login failed!');
        return;
      }
      
      // Save session
      const cookies = adapter.getCookies();
      if (cookies) {
        const { CookieVault } = require('./packages/auth/dist/index.js');
        const vault = new CookieVault();
        const encrypted = vault.encrypt(cookies);
        
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);
        
        await prisma.session.create({
          data: {
            accountId: account.id,
            cookies: encrypted,
            expiry,
            renewalAt: new Date(expiry.getTime() - 2 * 60 * 60 * 1000),
          },
        });
        console.log('✅ Session saved to database!');
      }
    }
    
    // Step 3: Get a draft to post
    console.log('\n3️⃣ Getting a draft to post...');
    const draft = await prisma.draft.findFirst({
      where: {
        accountId: account.id,
        approved: false,
      },
      include: {
        content: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    if (!draft) {
      console.log('⚠️ No unapproved drafts found, checking approved ones...');
      const approvedDraft = await prisma.draft.findFirst({
        where: {
          accountId: account.id,
        },
        include: {
          content: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      
      if (!approvedDraft) {
        console.error('❌ No drafts found!');
        return;
      }
      
      console.log(`✅ Using draft: ${approvedDraft.id}`);
      console.log(`   Content: ${approvedDraft.content.title.substring(0, 50)}...`);
      console.log(`   URL: ${approvedDraft.content.url}`);
      console.log(`   Reddit ID: ${approvedDraft.content.redditId}`);
      
      // Step 4: Post reply
      console.log('\n4️⃣ Posting reply...');
      const postUrl = approvedDraft.content.url || `https://www.reddit.com/comments/${approvedDraft.content.redditId}`;
      console.log(`   Post URL: ${postUrl}`);
      console.log(`   Reply: ${approvedDraft.llmOutput.substring(0, 100)}...`);
      
      const success = await adapter.postReply(postUrl, approvedDraft.content.redditId, approvedDraft.llmOutput);
      
      if (success) {
        console.log('\n✅✅✅ REPLY POSTED SUCCESSFULLY!');
        
        // Create post record
        await prisma.post.create({
          data: {
            accountId: account.id,
            draftId: approvedDraft.id,
            contentId: approvedDraft.contentId,
            redditId: approvedDraft.content.redditId,
            postedAt: new Date(),
            success: true,
          },
        });
        
        console.log('✅ Post record saved to database');
      } else {
        console.error('\n❌ Failed to post reply');
      }
    } else {
      console.log(`✅ Found draft: ${draft.id}`);
      console.log(`   Content: ${draft.content.title.substring(0, 50)}...`);
      console.log(`   URL: ${draft.content.url}`);
      console.log(`   Reddit ID: ${draft.content.redditId}`);
      
      // Step 4: Post reply
      console.log('\n4️⃣ Posting reply...');
      const postUrl = draft.content.url || `https://www.reddit.com/comments/${draft.content.redditId}`;
      console.log(`   Post URL: ${postUrl}`);
      console.log(`   Reply: ${draft.llmOutput.substring(0, 100)}...`);
      
      const success = await adapter.postReply(postUrl, draft.content.redditId, draft.llmOutput);
      
      if (success) {
        console.log('\n✅✅✅ REPLY POSTED SUCCESSFULLY!');
        
        // Update draft
        await prisma.draft.update({
          where: { id: draft.id },
          data: { approved: true },
        });
        
        // Create post record
        await prisma.post.create({
          data: {
            accountId: account.id,
            draftId: draft.id,
            contentId: draft.contentId,
            redditId: draft.content.redditId,
            postedAt: new Date(),
            success: true,
          },
        });
        
        // Update content status
        await prisma.content.update({
          where: { id: draft.contentId },
          data: { status: 'POSTED' },
        });
        
        console.log('✅ Draft approved and post record saved');
      } else {
        console.error('\n❌ Failed to post reply');
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test complete!');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testFullFlow();

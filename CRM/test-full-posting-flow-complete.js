const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amazing_abed',
    },
  },
});

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testFullFlow() {
  console.log('🧪 Testing Complete Posting Flow\n');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Get a pending draft
    console.log('\n1️⃣ Getting a PENDING draft...');
    const draft = await prisma.draft.findFirst({
      where: {
        status: 'PENDING',
      },
      include: {
        content: true,
        account: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    if (!draft) {
      console.log('⚠️ No PENDING drafts found, checking all drafts...');
      const allDrafts = await prisma.draft.findMany({
        include: { content: true, account: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });
      
      if (allDrafts.length === 0) {
        console.error('❌ No drafts found at all!');
        return;
      }
      
      console.log(`Using draft: ${allDrafts[0].id}`);
      console.log(`Status: ${allDrafts[0].status || 'NOT SET'}`);
      console.log(`Approved: ${allDrafts[0].approved}`);
      console.log(`Title: ${allDrafts[0].content.title?.substring(0, 50)}`);
      
      // Test the API endpoint
      console.log('\n2️⃣ Testing API endpoint...');
      try {
        const res = await axios.post(`${API_URL}/drafts/${allDrafts[0].id}/approve`, {
          postToReddit: true,
        }, {
          timeout: 120000, // 2 minutes timeout
        });
        
        console.log('✅ API Response:', res.data);
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Check draft status
        console.log('\n3️⃣ Checking draft status after posting...');
        const updatedDraft = await prisma.draft.findUnique({
          where: { id: allDrafts[0].id },
        });
        
        console.log(`   Status: ${updatedDraft.status}`);
        console.log(`   Approved: ${updatedDraft.approved}`);
        
        // Check posts
        const posts = await prisma.post.findMany({
          where: { draftId: allDrafts[0].id },
          orderBy: { postedAt: 'desc' },
        });
        
        console.log(`   Posts: ${posts.length}`);
        if (posts.length > 0) {
          console.log(`   Latest post success: ${posts[0].success}`);
        }
        
        if (updatedDraft.status === 'POSTED' && posts[0]?.success) {
          console.log('\n✅✅✅ FLOW COMPLETE - Draft updated to POSTED!');
        } else {
          console.log('\n⚠️ Draft status not updated correctly');
        }
      } catch (apiError) {
        console.error('❌ API Error:', apiError.response?.data || apiError.message);
      }
    } else {
      console.log(`✅ Found PENDING draft: ${draft.id}`);
      console.log(`   Title: ${draft.content.title?.substring(0, 50)}`);
      console.log(`   Status: ${draft.status}`);
      
      // Test the API endpoint
      console.log('\n2️⃣ Testing API endpoint...');
      try {
        const res = await axios.post(`${API_URL}/drafts/${draft.id}/approve`, {
          postToReddit: true,
        }, {
          timeout: 120000,
        });
        
        console.log('✅ API Response:', res.data);
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Check draft status
        console.log('\n3️⃣ Checking draft status after posting...');
        const updatedDraft = await prisma.draft.findUnique({
          where: { id: draft.id },
        });
        
        console.log(`   Status: ${updatedDraft.status}`);
        console.log(`   Approved: ${updatedDraft.approved}`);
        
        if (updatedDraft.status === 'POSTED') {
          console.log('\n✅✅✅ FLOW COMPLETE - Draft updated to POSTED!');
        } else {
          console.log('\n⚠️ Draft status not updated to POSTED');
        }
      } catch (apiError) {
        console.error('❌ API Error:', apiError.response?.data || apiError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFullFlow();

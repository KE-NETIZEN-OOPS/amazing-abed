const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testDrafts() {
  console.log('🧪 Testing Draft Generation...\n');
  
  try {
    // 1. Get accounts
    const accountsRes = await axios.get(`${API_URL}/accounts`);
    const accounts = accountsRes.data;
    
    if (accounts.length === 0) {
      console.log('❌ No accounts found');
      return;
    }
    
    const account = accounts[0];
    console.log(`1. Using account: ${account.username}\n`);
    
    // 2. Get content
    const contentRes = await axios.get(`${API_URL}/content`);
    const content = contentRes.data;
    console.log(`2. Found ${content.length} pieces of content\n`);
    
    // 3. Manually trigger processing for some content
    console.log('3. Triggering processing for NSFW/rating posts...\n');
    
    const relevantContent = content.filter(c => 
      c.rawData?.isNsfw || 
      c.subreddit.toLowerCase().includes('dick') ||
      c.subreddit.toLowerCase().includes('rate') ||
      c.title.toLowerCase().includes('rate')
    ).slice(0, 5);
    
    console.log(`   Found ${relevantContent.length} relevant posts to process\n`);
    
    // 4. Check drafts
    console.log('4. Checking for drafts...\n');
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for processing
    
    const draftsRes = await axios.get(`${API_URL}/drafts`);
    const drafts = draftsRes.data;
    
    console.log(`   Found ${drafts.length} drafts\n`);
    
    if (drafts.length > 0) {
      console.log('📋 Generated Drafts:');
      console.log('='.repeat(80));
      drafts.forEach((draft, i) => {
        console.log(`\n${i + 1}. Draft for: ${draft.content.title}`);
        console.log(`   Subreddit: r/${draft.content.subreddit}`);
        console.log(`   Draft: ${draft.llmOutput.substring(0, 150)}...`);
        console.log(`   Approved: ${draft.approved ? 'Yes' : 'No'}`);
      });
    } else {
      console.log('⚠️  No drafts generated yet.');
      console.log('   The worker may still be processing, or content may not meet criteria.');
      console.log('   Try again in a few seconds.');
    }
    
    console.log('\n✅ Draft test complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testDrafts();

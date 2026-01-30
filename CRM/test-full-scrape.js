const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testFullScrape() {
  console.log('🧪 Testing Full Scraping Flow...\n');
  
  try {
    // 1. Get or create account
    console.log('1. Checking accounts...');
    let accountsRes = await axios.get(`${API_URL}/accounts`);
    let accounts = accountsRes.data;
    
    let account;
    if (accounts.length === 0) {
      console.log('   No accounts found, creating one...');
      const createRes = await axios.post(`${API_URL}/accounts`, {
        username: 'WonderfulBook9970',
        password: 'Kenya254@_',
        type: 'BOTH',
      });
      account = createRes.data.account || createRes.data;
      console.log(`   ✅ Account created: ${account.username} (${account.id})\n`);
    } else {
      account = accounts[0];
      console.log(`   ✅ Found account: ${account.username} (${account.id})\n`);
    }
    
    // 2. Start scraping
    console.log('2. Starting scraping...');
    const startRes = await axios.post(`${API_URL}/scraping/start/${account.id}`);
    console.log(`   Response: ${JSON.stringify(startRes.data)}\n`);
    
    if (!startRes.data.success) {
      console.log(`   ❌ Failed to start: ${startRes.data.error}`);
      return;
    }
    
    // 3. Wait and check status
    console.log('3. Waiting 30 seconds for scraping to run...\n');
    for (let i = 0; i < 6; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const statusRes = await axios.get(`${API_URL}/scraping/status/${account.id}`);
      const status = statusRes.data;
      console.log(`   [${(i+1)*5}s] Status: Active=${status.active}, Posts Found=${status.postsFound || 0}`);
    }
    
    // 4. Check scraped content
    console.log('\n4. Checking scraped content...');
    const contentRes = await axios.get(`${API_URL}/content`);
    const content = contentRes.data;
    console.log(`   ✅ Found ${content.length} pieces of content\n`);
    
    if (content.length > 0) {
      console.log('📋 Scraped Posts (NSFW/Keyword Filtered):');
      console.log('='.repeat(80));
      
      content.forEach((item, i) => {
        const isNsfw = item.rawData?.isNsfw || false;
        const text = `${item.title} ${item.body || ''}`.toLowerCase();
        const hasKeyword = ['dickrating', 'dick rating', 'rate', 'nsfw'].some(kw => text.includes(kw));
        
        console.log(`\n${i + 1}. ${item.title}`);
        console.log(`   Subreddit: r/${item.subreddit}`);
        console.log(`   Author: u/${item.author}`);
        console.log(`   NSFW: ${isNsfw ? '✅ YES' : '❌ NO'}`);
        console.log(`   Has Keyword: ${hasKeyword ? '✅ YES' : '❌ NO'}`);
        console.log(`   Status: ${item.status}`);
        console.log(`   Intent: ${item.intentType || 'N/A'}`);
        console.log(`   URL: ${item.url}`);
        if (item.body) {
          console.log(`   Preview: ${item.body.substring(0, 150)}...`);
        }
      });
      
      // Summary
      const nsfwCount = content.filter(c => c.rawData?.isNsfw).length;
      const keywordCount = content.filter(c => {
        const text = `${c.title} ${c.body || ''}`.toLowerCase();
        return ['dickrating', 'dick rating', 'rate', 'nsfw'].some(kw => text.includes(kw));
      }).length;
      
      console.log('\n' + '='.repeat(80));
      console.log(`📊 Summary:`);
      console.log(`   Total Posts: ${content.length}`);
      console.log(`   NSFW Posts: ${nsfwCount}`);
      console.log(`   Posts with Keywords: ${keywordCount}`);
      console.log('='.repeat(80));
    } else {
      console.log('   ⚠️  No content scraped yet. The scraping may still be running.');
      console.log('   Try again in a few minutes or check the scraping status.');
    }
    
    console.log('\n✅ Full scrape test complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   ⚠️  API server is not running on port 3001');
      console.error('   Start it with: cd apps/api && npm run dev');
    }
  }
}

testFullScrape();

const axios = require('axios');

async function testScrapingAPI() {
  console.log('🧪 Testing Scraping API...\n');
  
  try {
    // Get accounts
    console.log('1. Getting accounts...');
    const accountsRes = await axios.get('http://localhost:3001/accounts');
    const accounts = accountsRes.data;
    console.log(`   Found ${accounts.length} accounts\n`);
    
    if (accounts.length === 0) {
      console.log('❌ No accounts found. Please seed the database first.');
      return;
    }
    
    const account = accounts[0];
    console.log(`2. Starting scraping for account: ${account.username} (${account.id})\n`);
    
    // Start scraping
    const startRes = await axios.post(`http://localhost:3001/scraping/start/${account.id}`);
    console.log(`   ✅ Scraping started: ${JSON.stringify(startRes.data)}\n`);
    
    // Wait a bit and check status
    console.log('3. Waiting 15 seconds for scraping to run...\n');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    const statusRes = await axios.get(`http://localhost:3001/scraping/status/${account.id}`);
    console.log(`   Status: ${JSON.stringify(statusRes.data)}\n`);
    
    // Check content
    console.log('4. Checking scraped content...');
    const contentRes = await axios.get('http://localhost:3001/content');
    const content = contentRes.data;
    console.log(`   Found ${content.length} pieces of content\n`);
    
    if (content.length > 0) {
      console.log('📋 Sample content:');
      content.slice(0, 5).forEach((item, i) => {
        console.log(`\n   ${i + 1}. ${item.title}`);
        console.log(`      Subreddit: r/${item.subreddit}`);
        console.log(`      Author: u/${item.author}`);
        console.log(`      Status: ${item.status}`);
        console.log(`      Intent: ${item.intentType || 'N/A'}`);
      });
    }
    
    console.log('\n✅ API test complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testScrapingAPI();

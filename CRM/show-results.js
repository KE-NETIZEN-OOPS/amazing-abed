const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function showResults() {
  console.log('📊 Showing Scraped Results...\n');
  
  try {
    const contentRes = await axios.get(`${API_URL}/content`);
    const content = contentRes.data;
    
    console.log(`Total Posts Scraped: ${content.length}\n`);
    
    // Filter for NSFW
    const nsfwPosts = content.filter(c => c.rawData?.isNsfw);
    console.log(`\n🔞 NSFW Posts (${nsfwPosts.length}):`);
    console.log('='.repeat(80));
    nsfwPosts.slice(0, 10).forEach((item, i) => {
      console.log(`\n${i + 1}. ${item.title}`);
      console.log(`   Subreddit: r/${item.subreddit}`);
      console.log(`   URL: ${item.url}`);
    });
    
    // Filter for dickrating keyword
    const dickratingPosts = content.filter(c => {
      const text = `${c.title} ${c.body || ''}`.toLowerCase();
      return text.includes('dickrating') || text.includes('dick rating') || 
             text.includes('dickrate') || text.includes('rate my dick') ||
             text.includes('rate my cock') || text.includes('dick rate');
    });
    
    console.log(`\n\n🎯 Posts with "dickrating" keyword (${dickratingPosts.length}):`);
    console.log('='.repeat(80));
    dickratingPosts.forEach((item, i) => {
      console.log(`\n${i + 1}. ${item.title}`);
      console.log(`   Subreddit: r/${item.subreddit}`);
      console.log(`   NSFW: ${item.rawData?.isNsfw ? '✅ YES' : '❌ NO'}`);
      console.log(`   URL: ${item.url}`);
      if (item.body) {
        console.log(`   Preview: ${item.body.substring(0, 100)}...`);
      }
    });
    
    // Summary
    console.log('\n\n📊 SUMMARY:');
    console.log('='.repeat(80));
    console.log(`Total Posts: ${content.length}`);
    console.log(`NSFW Posts: ${nsfwPosts.length}`);
    console.log(`Posts with "dickrating" keyword: ${dickratingPosts.length}`);
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

showResults();

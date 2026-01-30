const { Crawl4aiRedditAdapter } = require('./packages/reddit-adapter/src/index.ts');

async function testScraping() {
  console.log('🧪 Testing Reddit Scraping...\n');
  
  const adapter = new Crawl4aiRedditAdapter();
  
  // Test login
  console.log('1. Testing login...');
  const loggedIn = await adapter.login('WonderfulBook9970', 'Kenya254@_');
  console.log(`   Login result: ${loggedIn ? '✅ SUCCESS' : '❌ FAILED'}\n`);
  
  if (!loggedIn) {
    console.log('❌ Cannot proceed without login');
    return;
  }
  
  // Test scraping with keyword filter
  console.log('2. Testing scraping for keyword "dickrating"...');
  const posts = await adapter.scrapeLatestPosts('all', 100, 'hour');
  console.log(`   Found ${posts.length} posts in last 30 minutes\n`);
  
  // Filter for keyword
  const filtered = posts.filter(post => {
    const text = `${post.title} ${post.body || ''}`.toLowerCase();
    return text.includes('dickrating') || text.includes('dick rating') || text.includes('rate');
  });
  
  console.log(`3. Posts containing "dickrating" or related: ${filtered.length}\n`);
  
  if (filtered.length > 0) {
    console.log('📋 Sample posts:');
    filtered.slice(0, 5).forEach((post, i) => {
      console.log(`\n   ${i + 1}. ${post.title}`);
      console.log(`      Subreddit: r/${post.subreddit}`);
      console.log(`      Author: u/${post.author}`);
      console.log(`      URL: ${post.url}`);
      console.log(`      NSFW: ${post.isNsfw ? 'Yes' : 'No'}`);
    });
  } else {
    console.log('   No posts found with keyword. Showing all recent posts:');
    posts.slice(0, 5).forEach((post, i) => {
      console.log(`\n   ${i + 1}. ${post.title}`);
      console.log(`      Subreddit: r/${post.subreddit}`);
    });
  }
  
  console.log('\n✅ Scraping test complete!');
}

testScraping().catch(console.error);

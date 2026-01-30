const axios = require('axios');

async function testRedditScraping() {
  console.log('🧪 Testing Reddit API directly...\n');
  
  try {
    // Test Reddit JSON API
    const url = 'https://www.reddit.com/r/all/new.json?limit=25&t=hour';
    
    console.log('1. Fetching posts from Reddit...');
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    const data = response.data;
    const posts = [];
    
    if (data?.data?.children) {
      const now = Date.now() / 1000;
      const thirtyMinutesAgo = now - (30 * 60);
      
      for (const child of data.data.children) {
        const post = child.data;
        const createdUtc = post.created_utc;
        
        if (createdUtc >= thirtyMinutesAgo) {
          posts.push({
            id: post.id,
            title: post.title,
            body: post.selftext,
            author: post.author,
            subreddit: post.subreddit,
            url: `https://reddit.com${post.permalink}`,
            isNsfw: post.over_18 || false,
            createdUtc: createdUtc,
          });
        }
      }
    }
    
    console.log(`   ✅ Found ${posts.length} posts in last 30 minutes\n`);
    
    // Filter for keyword
    const keyword = 'dickrating';
    const filtered = posts.filter(post => {
      const text = `${post.title} ${post.body || ''}`.toLowerCase();
      return text.includes('dickrating') || 
             text.includes('dick rating') || 
             text.includes('rate') ||
             text.includes('rating');
    });
    
    console.log(`2. Posts containing "${keyword}" or related: ${filtered.length}\n`);
    
    if (filtered.length > 0) {
      console.log('📋 Sample posts:');
      filtered.slice(0, 10).forEach((post, i) => {
        console.log(`\n   ${i + 1}. ${post.title}`);
        console.log(`      Subreddit: r/${post.subreddit}`);
        console.log(`      Author: u/${post.author}`);
        console.log(`      URL: ${post.url}`);
        console.log(`      NSFW: ${post.isNsfw ? 'Yes' : 'No'}`);
        if (post.body) {
          console.log(`      Preview: ${post.body.substring(0, 100)}...`);
        }
      });
    } else {
      console.log('   No posts found with keyword. Showing all recent posts:');
      posts.slice(0, 10).forEach((post, i) => {
        console.log(`\n   ${i + 1}. ${post.title}`);
        console.log(`      Subreddit: r/${post.subreddit}`);
        console.log(`      NSFW: ${post.isNsfw ? 'Yes' : 'No'}`);
      });
    }
    
    console.log('\n✅ Reddit API test complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testRedditScraping();

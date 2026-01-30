const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { Queue } = require('bullmq');
const Redis = require('ioredis');

const prisma = new PrismaClient();
const redis = new Redis('redis://localhost:6379');
const processingQueue = new Queue('processing', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

async function processExistingContent() {
  console.log('🔄 Processing existing content to generate drafts...\n');
  
  try {
    // Get all content that hasn't been processed yet
    const content = await prisma.content.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        account: true,
      },
      take: 50,
    });
    
    console.log(`Found ${content.length} pieces of content to process\n`);
    
    // Add to processing queue
    for (const item of content) {
      await processingQueue.add('process-content', {
        contentId: item.id,
        accountId: item.accountId,
      });
      console.log(`✅ Queued: ${item.title.substring(0, 50)}...`);
    }
    
    console.log(`\n✅ Queued ${content.length} items for processing`);
    console.log('   Waiting 30 seconds for worker to process...\n');
    
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Check drafts
    const drafts = await prisma.draft.findMany({
      include: {
        content: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log(`\n📋 Generated Drafts: ${drafts.length}\n`);
    
    if (drafts.length > 0) {
      drafts.forEach((draft, i) => {
        console.log(`${i + 1}. ${draft.content.title}`);
        console.log(`   Subreddit: r/${draft.content.subreddit}`);
        console.log(`   Draft: ${draft.llmOutput.substring(0, 100)}...`);
        console.log('');
      });
    }
    
    await prisma.$disconnect();
    await redis.quit();
    
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    await redis.quit();
  }
}

processExistingContent();

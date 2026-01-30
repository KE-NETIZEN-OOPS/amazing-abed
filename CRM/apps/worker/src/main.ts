import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { IntentDetector } from '@amazing-abed/nlp';
import { FluffyCloudStethroAdapter } from '@amazing-abed/llm-adapter';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const intentDetector = new IntentDetector();
const llmAdapter = new FluffyCloudStethroAdapter();

console.log('🔧 Worker initialized');

// Process content queue
const processingWorker = new Worker(
  'processing',
  async (job) => {
    const { contentId, accountId } = job.data;
    
    console.log(`\n🔄 Processing content ${contentId} for account ${accountId}`);
    
    try {
      // Get content
      const content = await prisma.content.findUnique({
        where: { id: contentId },
        include: { account: true },
      });

      if (!content) {
        console.error(`❌ Content ${contentId} not found`);
        throw new Error('Content not found');
      }

      console.log(`   Title: ${content.title.substring(0, 50)}...`);

      // Run NLP analysis
      const intentResult = intentDetector.detectIntent(content.title, content.body || '');
      console.log(`   Intent: ${intentResult.type} (confidence: ${intentResult.confidence})`);
      
      // Get keywords for account
      const keywords = await prisma.keyword.findMany({
        where: { accountId: accountId || null },
      });

      const keywordVariants = keywords.length > 0 
        ? keywords.flatMap(k => k.variants)
        : ['dickrating', 'dick rating', 'rate', 'rating', 'nsfw', 'rate me'];

      const relevanceScore = intentDetector.calculateRelevanceScore(
        keywordVariants,
        content.title,
        content.body || ''
      );

      console.log(`   Relevance Score: ${relevanceScore}`);

      // Update content with intent and score
      await prisma.content.update({
        where: { id: contentId },
        data: {
          intentType: intentResult.type,
          intentScore: intentResult.confidence * relevanceScore,
          status: intentResult.type === 'REQUESTING_SERVICE' ? 'VERIFIED' : 'REJECTED',
        },
      });

      // Generate draft if relevant (lower threshold to catch more posts)
      const rawData = content.rawData as any;
      const isNsfw = rawData?.isNsfw || false;
      
      const shouldGenerateDraft = 
        intentResult.type === 'REQUESTING_SERVICE' && 
        (relevanceScore > 0.3 || 
         isNsfw || 
         content.subreddit.toLowerCase().includes('dick') || 
         content.subreddit.toLowerCase().includes('rate') ||
         content.title.toLowerCase().includes('rate') ||
         content.title.toLowerCase().includes('think'));

      if (shouldGenerateDraft) {
        console.log(`   ✅ Generating draft...`);
        
        const masterPrompt = `You are a friendly and helpful assistant responding to Reddit posts. Be engaging, natural, and helpful.`;
        const accountPrompt = `Respond as ${content.account.username || 'a helpful user'}.`;
        
        const draft = await llmAdapter.generateDraft(
          masterPrompt,
          accountPrompt,
          {
            title: content.title,
            body: content.body,
            author: content.author,
            subreddit: content.subreddit,
            url: content.url,
          }
        );

        console.log(`   📝 Draft generated: ${draft.substring(0, 100)}...`);

        await prisma.draft.create({
          data: {
            accountId,
            contentId,
            llmOutput: draft,
          },
        });

        console.log(`   ✅ Draft saved for content ${contentId}`);
      } else {
        console.log(`   ⏭️  Skipping draft (intent: ${intentResult.type}, relevance: ${relevanceScore})`);
      }

      return { success: true, contentId, intentType: intentResult.type, draftGenerated: shouldGenerateDraft };
    } catch (error) {
      console.error(`❌ Error processing content ${contentId}:`, error);
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  },
);

console.log('✅ Worker started and listening for jobs');

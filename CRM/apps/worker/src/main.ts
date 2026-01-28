import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { IntentDetector } from '@amazing-abed/nlp';
import { FluffyCloudStethroAdapter } from '@amazing-abed/llm-adapter';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const intentDetector = new IntentDetector();
const llmAdapter = new FluffyCloudStethroAdapter();

// Process content queue
const processingWorker = new Worker(
  'processing',
  async (job) => {
    const { contentId, accountId } = job.data;
    
    console.log(`Processing content ${contentId}`);
    
    // Get content
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: { account: true },
    });

    if (!content) {
      throw new Error('Content not found');
    }

    // Run NLP analysis
    const intentResult = intentDetector.detectIntent(content.title, content.body || '');
    
    // Get keywords for account
    const keywords = await prisma.keyword.findMany({
      where: { accountId: accountId || null },
    });

    const relevanceScore = intentDetector.calculateRelevanceScore(
      keywords.flatMap(k => k.variants),
      content.title,
      content.body || ''
    );

    // Update content with intent and score
    await prisma.content.update({
      where: { id: contentId },
      data: {
        intentType: intentResult.type,
        intentScore: intentResult.confidence * relevanceScore,
        status: intentResult.type === 'REQUESTING_SERVICE' ? 'VERIFIED' : 'REJECTED',
      },
    });

    // If relevant, generate draft
    if (intentResult.type === 'REQUESTING_SERVICE' && relevanceScore > 0.5) {
      const masterPrompt = 'You are a helpful assistant responding to Reddit posts.';
      const accountPrompt = content.account.username || '';
      
      const draft = await llmAdapter.generateDraft(
        masterPrompt,
        accountPrompt,
        content
      );

      await prisma.draft.create({
        data: {
          accountId,
          contentId,
          llmOutput: draft,
        },
      });
    }

    return { success: true, contentId, intentType: intentResult.type };
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  },
);

console.log('✅ Worker started and listening for jobs');

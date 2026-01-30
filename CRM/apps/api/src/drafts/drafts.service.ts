import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Crawl4aiRedditAdapter } from '@amazing-abed/reddit-adapter';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class DraftsService {
  private adapters: Map<string, Crawl4aiRedditAdapter> = new Map();

  constructor(
    private prisma: PrismaService,
    private sessionsService: SessionsService,
  ) {}

  async findAll() {
    return this.prisma.draft.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        content: true,
        account: true,
      },
    });
  }

  async approveAndPost(draftId: string, postToReddit: boolean = true) {
    try {
      const draft = await this.prisma.draft.findUnique({
        where: { id: draftId },
        include: {
          content: true,
          account: true,
        },
      });

      if (!draft) {
        throw new Error(`Draft with id ${draftId} not found`);
      }

      if (!draft.account) {
        throw new Error(`Account not found for draft ${draftId}`);
      }

      if (!draft.content) {
        throw new Error(`Content not found for draft ${draftId}`);
      }

      if (!draft.account.username || !draft.account.password) {
        throw new Error(`Account credentials missing for account ${draft.accountId}`);
      }

      // Update draft as approved (but keep status as PENDING until post succeeds)
      await this.prisma.draft.update({
        where: { id: draftId },
        data: { approved: true },
        // Don't change status here - it will be updated after successful post
      });

      let postResult = null;

      if (postToReddit) {
        try {
          // Get or create adapter for this account
          let adapter = this.adapters.get(draft.accountId);
          if (!adapter) {
            console.log(`Creating new adapter for account ${draft.account.username}`);
            adapter = new Crawl4aiRedditAdapter();
            
                  // Check for existing valid session FIRST
                  const savedCookies = await this.sessionsService.getValidSession(draft.accountId);
                  
                  if (savedCookies) {
                    console.log(`✅ Found valid session for account ${draft.account.username}, using saved cookies`);
                    adapter.setCookies(savedCookies);
                    console.log(`✅ Cookies loaded: ${savedCookies.split('; ').length} cookies`);
                    
                    // Verify login status (but don't fail if it takes too long - cookies might still work)
                    try {
                      const isLoggedIn = await Promise.race([
                        adapter.verifyLoginStatus(),
                        new Promise((resolve) => setTimeout(() => resolve(false), 5000)), // 5 second timeout
                      ]);
                      
                      if (isLoggedIn) {
                        console.log(`✅ Verified logged in with saved session`);
                      } else {
                        console.warn('⚠️ Could not verify login status quickly, but will try posting anyway with cookies');
                      }
                    } catch (verifyError) {
                      console.warn('⚠️ Login verification failed, but will try posting anyway:', verifyError.message);
                    }
                    
                    // Set adapter and skip login
                    this.adapters.set(draft.accountId, adapter);
                    console.log(`✅ Using saved session, skipping login`);
                  } else {
                    // No valid session, need to login
                    console.log(`No valid session found, logging in to Reddit as ${draft.account.username}...`);
                    try {
                      const loggedIn = await adapter.login(draft.account.username, draft.account.password);
                      if (!loggedIn) {
                        throw new Error(`Failed to login to Reddit with account ${draft.account.username} - login returned false`);
                      }
                      
                      // Save session after successful login
                      const cookies = adapter.getCookies();
                      if (cookies) {
                        console.log(`💾 Saving session with ${cookies.split('; ').length} cookies...`);
                        await this.sessionsService.saveSession(draft.accountId, cookies, 24);
                        console.log(`✅ Saved session for account ${draft.account.username}`);
                      } else {
                        console.error(`❌ No cookies to save after login!`);
                      }
                      
                      this.adapters.set(draft.accountId, adapter);
                    } catch (loginError) {
                      throw new Error(`Failed to login to Reddit with account ${draft.account.username}: ${loginError.message || String(loginError)}`);
                    }
                  }
            
            this.adapters.set(draft.accountId, adapter);
            console.log(`✅ Adapter ready for account ${draft.account.username}`);
          } else {
            console.log(`Using existing adapter for account ${draft.account.username}`);
          }

          // Post reply to Reddit - use URL if available, otherwise construct from redditId
          // Reddit URLs are stored as full URLs like https://reddit.com/r/subreddit/comments/postid/title/
          let postUrl = draft.content.url;
          
          // If URL is missing or invalid, construct from redditId
          if (!postUrl || postUrl === 'undefined' || postUrl === 'null' || !postUrl.includes('reddit.com')) {
            // Try to get permalink from rawData if available
            const rawData = draft.content.rawData as any;
            if (rawData?.permalink) {
              postUrl = `https://www.reddit.com${rawData.permalink}`;
              console.log(`Using permalink from rawData: ${postUrl}`);
            } else {
              postUrl = `https://www.reddit.com/comments/${draft.content.redditId}`;
              console.log(`Constructed URL from redditId: ${postUrl}`);
            }
          }
          
          console.log(`📝 Posting reply to Reddit post:`);
          console.log(`   URL: ${postUrl}`);
          console.log(`   Reddit ID: ${draft.content.redditId}`);
          console.log(`   Reply length: ${draft.llmOutput.length} chars`);
          
          const success = await adapter.postReply(postUrl, draft.content.redditId, draft.llmOutput);
          
          if (success) {
            // Use transaction to ensure all updates happen atomically
            console.log('💾 Starting transaction to update post, draft, and content...');
            const result = await this.prisma.$transaction(async (tx) => {
              // Create post record - track this post for future reference
              const newPost = await tx.post.create({
                data: {
                  accountId: draft.accountId,
                  draftId: draftId,
                  contentId: draft.contentId,
                  redditId: draft.content.redditId, // Track the original post ID we replied to
                  postedAt: new Date(),
                  success: true,
                },
              });

              // Update draft status to POSTED
              await tx.draft.update({
                where: { id: draftId },
                data: { 
                  status: 'POSTED',
                  approved: true,
                },
              });

              // Update content status
              await tx.content.update({
                where: { id: draft.contentId },
                data: { status: 'POSTED' },
              });
              
              console.log('✅ Transaction completed - all updates committed');
              return newPost;
            });
            
            postResult = result;
            
            console.log(`✅✅✅ Successfully posted reply to Reddit!`);
            console.log(`   Post ID: ${postResult.id}`);
            console.log(`   Reddit Post ID: ${draft.content.redditId}`);
            console.log(`   Draft status updated to POSTED`);
            console.log(`   Content status updated to POSTED`);
            console.log(`   All updates committed atomically`);
          } else {
            // Check if it's a rate limit issue
            const errorMsg = 'Failed to post to Reddit - adapter returned false. This might be due to rate limiting (429 error). Please wait a few minutes and try again.';
            throw new Error(errorMsg);
          }
        } catch (error) {
          console.error('Error posting to Reddit:', error);
          console.error('Error stack:', error.stack);
          
          // Create post record with error
          try {
            postResult = await this.prisma.post.create({
              data: {
                accountId: draft.accountId,
                draftId: draftId,
                contentId: draft.contentId,
                postedAt: new Date(),
                success: false,
                error: error.message || String(error),
              },
            });
            
            // Check if the error mentions 429 or rate limit, but comment might have posted
            const errorMsg = error.message || String(error);
            if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
              console.log('⚠️ Rate limit error - checking if comment was posted anyway...');
              // Don't update draft status yet - user should verify manually
            } else {
              // For other errors, keep draft as PENDING
              console.log('⚠️ Posting failed - draft remains PENDING');
            }
          } catch (dbError) {
            console.error('Failed to create post record:', dbError);
          }

          // Re-throw with more context
          throw new HttpException(`Failed to post to Reddit: ${error.message || String(error)}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }

      return {
        success: true,
        draft,
        post: postResult,
      };
    } catch (error) {
      console.error('Error in approveAndPost service:', error);
      throw error;
    }
  }

  async reject(draftId: string) {
    await this.prisma.draft.update({
      where: { id: draftId },
      data: { 
        approved: false,
        status: 'REJECTED',
      },
    });

    return { success: true };
  }
}

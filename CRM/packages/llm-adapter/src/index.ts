export interface LLMAdapter {
  generateDraft(masterPrompt: string, accountPrompt: string, content: any): Promise<string>;
}

export class FluffyCloudStethroAdapter implements LLMAdapter {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.LLM_SERVICE_URL || 'http://localhost:8000';
  }

  async generateDraft(
    masterPrompt: string,
    accountPrompt: string,
    content: any
  ): Promise<string> {
    try {
      // For now, generate a simple draft without external LLM service
      // In production, this would call your LLM service
      
      const title = content.title || '';
      const body = content.body || '';
      const subreddit = content.subreddit || '';
      
      // Generate context-aware draft
      let draft = '';
      
      if (subreddit.toLowerCase().includes('dick') || title.toLowerCase().includes('rate')) {
        draft = `Hey! Thanks for sharing. I'd be happy to give you some feedback. `;
        draft += `Feel free to DM me if you want to chat more or have any questions! 😊`;
      } else if (title.toLowerCase().includes('help') || title.toLowerCase().includes('advice')) {
        draft = `I'd be happy to help! `;
        draft += `Based on what you've shared, here's my take: [Your response here]. `;
        draft += `Feel free to reach out if you need more help!`;
      } else {
        draft = `Thanks for the post! `;
        draft += `I found this interesting and would love to engage. `;
        draft += `Feel free to DM me if you want to continue the conversation!`;
      }
      
      // If LLM service is available, use it
      try {
        const axios = await import('axios');
        const response = await axios.default.post(`${this.baseUrl}/generate`, {
          masterPrompt,
          accountPrompt,
          content: {
            title: content.title,
            body: content.body,
            author: content.author,
            subreddit: content.subreddit,
          },
        }, { timeout: 5000 });

        if (response.data?.draft) {
          return response.data.draft;
        }
      } catch (llmError) {
        // LLM service not available, use generated draft
        console.log('Using fallback draft generation');
      }

      return draft;
    } catch (error) {
      console.error('LLM generation error:', error);
      // Return a fallback draft
      return `Hey! Thanks for sharing. I'd be happy to help. Feel free to DM me if you want to chat! 😊`;
    }
  }
}

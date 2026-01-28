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
      });

      return response.data.draft || 'No draft generated';
    } catch (error) {
      console.error('LLM generation error:', error);
      return 'Error generating draft';
    }
  }
}

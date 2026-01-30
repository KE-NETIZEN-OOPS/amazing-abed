import { WordNet, TfIdf } from 'natural';

export interface IntentResult {
  type: 'REQUESTING_SERVICE' | 'OFFERING_SERVICE' | 'IRRELEVANT';
  score: number;
  confidence: number;
}

export class IntentDetector {
  private requestingPhrases = [
    'rate me',
    'what size',
    'can you',
    'looking for',
    'need',
    'want',
    'seeking',
    'hiring',
    'interested in',
  ];

  private offeringPhrases = [
    'selling',
    'for sale',
    'available',
    'offering',
    'advertising',
    'promo',
    'discount',
  ];

  detectIntent(title: string, body: string = ''): IntentResult {
    const text = `${title} ${body}`.toLowerCase();
    
    // Check for offering (selling/advertising) - auto-reject
    const offeringScore = this.offeringPhrases.reduce((score, phrase) => {
      return score + (text.includes(phrase) ? 1 : 0);
    }, 0);

    if (offeringScore > 0) {
      return {
        type: 'IRRELEVANT',
        score: 0,
        confidence: 1.0,
      };
    }

    // Check for requesting - expanded phrases
    const requestingPhrases = [
      ...this.requestingPhrases,
      'rate me', 'rate my', 'what do you think', 'how do i look',
      'am i', 'should i', 'can you', 'help me', 'need', 'want',
      'opinion', 'thoughts', 'feedback', 'advice', 'suggestions'
    ];
    
    const requestingScore = requestingPhrases.reduce((score, phrase) => {
      return score + (text.includes(phrase) ? 1 : 0);
    }, 0);

    // Also check for question marks (often indicates requesting)
    const hasQuestion = text.includes('?');

    if (requestingScore > 0 || hasQuestion) {
      return {
        type: 'REQUESTING_SERVICE',
        score: requestingScore + (hasQuestion ? 1 : 0),
        confidence: Math.min((requestingScore + (hasQuestion ? 1 : 0)) / 3, 1.0),
      };
    }

    return {
      type: 'IRRELEVANT',
      score: 0,
      confidence: 0.3,
    };
  }

  calculateRelevanceScore(keywords: string[], title: string, body: string = ''): number {
    const text = `${title} ${body}`.toLowerCase();
    let score = 0;

    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }

    return Math.min(score / keywords.length, 1.0);
  }
}

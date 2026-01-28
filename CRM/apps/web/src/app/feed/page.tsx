'use client';

import { useEffect, useState } from 'react';

interface Content {
  id: string;
  title: string;
  body: string;
  author: string;
  subreddit: string;
  url: string;
  status: string;
  intentType: string | null;
  intentScore: number;
  createdAt: string;
}

export default function FeedPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content`);
        const data = await res.json();
        setContent(data);
      } catch (error) {
        console.error('Failed to fetch content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
    // Refresh every 5 seconds with smooth polling
    const interval = setInterval(() => {
      fetchContent().catch(err => console.error('Feed refresh error:', err));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold neon-cyan mb-8">Live Feed</h1>

        <div className="space-y-4">
          {content.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-cyan-500 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{item.title}</h2>
                  {item.body && (
                    <p className="text-gray-400 mb-2 line-clamp-3">{item.body}</p>
                  )}
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>r/{item.subreddit}</span>
                    <span>u/{item.author}</span>
                    <span>Status: {item.status}</span>
                    {item.intentType && (
                      <span className="text-cyan-400">
                        Intent: {item.intentType} ({item.intentScore.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 text-cyan-400 hover:text-cyan-300"
                >
                  View →
                </a>
              </div>
            </div>
          ))}
          {content.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No content scraped yet. Start scraping to see posts here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

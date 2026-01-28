'use client';

import { useEffect, useState } from 'react';

interface Draft {
  id: string;
  llmOutput: string;
  approved: boolean;
  content: {
    title: string;
    url: string;
    subreddit: string;
  };
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drafts`);
        const data = await res.json();
        setDrafts(data);
      } catch (error) {
        console.error('Failed to fetch drafts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
    const interval = setInterval(fetchDrafts, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold neon-cyan mb-8">Drafts</h1>

        <div className="space-y-4">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6"
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">{draft.content.title}</h2>
                <div className="text-sm text-gray-400">
                  r/{draft.content.subreddit}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-gray-300 whitespace-pre-wrap">{draft.llmOutput}</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">
                  Approve & Post
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
                  Edit
                </button>
                <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">
                  Reject
                </button>
              </div>
            </div>
          ))}
          {drafts.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No drafts generated yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/api';

interface Draft {
  id: string;
  llmOutput: string;
  approved: boolean;
  status: 'PENDING' | 'POSTED' | 'REJECTED';
  content: {
    title: string;
    url: string;
    subreddit: string;
  };
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'POSTED'>('ALL');

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const res = await fetch(getApiUrl('/drafts'));
        const data = await res.json();
        setDrafts(data);
      } catch (error) {
        console.error('Failed to fetch drafts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
    // Refresh every 5 seconds with smooth polling
    const interval = setInterval(() => {
      fetchDrafts().catch(err => console.error('Drafts refresh error:', err));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const filteredDrafts = filter === 'ALL' 
    ? drafts 
    : drafts.filter(d => d.status === filter);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold neon-cyan">Drafts</h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'ALL' | 'PENDING' | 'POSTED')}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="ALL">All Drafts</option>
            <option value="PENDING">Pending</option>
            <option value="POSTED">Posted</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredDrafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6"
            >
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold">{draft.content.title}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    draft.status === 'POSTED' ? 'bg-green-600 text-white' :
                    draft.status === 'REJECTED' ? 'bg-red-600 text-white' :
                    'bg-yellow-600 text-white'
                  }`}>
                    {draft.status}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  r/{draft.content.subreddit}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-gray-300 whitespace-pre-wrap">{draft.llmOutput}</p>
              </div>
              <div className="flex gap-2">
                {draft.status !== 'POSTED' && (
                  <button
                    onClick={async (event: React.MouseEvent<HTMLButtonElement>) => {
                      const button = event.currentTarget;
                      button.disabled = true;
                      button.textContent = 'Posting...';
                      
                      try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drafts/${draft.id}/approve`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ postToReddit: true }),
                        });
                        
                        const data = await res.json();
                        
                        if (res.ok && data.success) {
                          alert('✅ Draft approved and posted to Reddit!');
                          // Refresh drafts
                          const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drafts`);
                          const data2 = await res2.json();
                          setDrafts(data2);
                        } else {
                          const errorMsg = data.message || data.error || 'Unknown error';
                          alert(`❌ Failed to post: ${errorMsg}`);
                          button.disabled = false;
                          button.textContent = 'Approve & Post';
                        }
                      } catch (error: any) {
                        console.error('Error:', error);
                        alert(`❌ Failed to post to Reddit: ${error.message || 'Network error'}`);
                        button.disabled = false;
                        button.textContent = 'Approve & Post';
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve & Post
                  </button>
                )}
                <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
                  Edit
                </button>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drafts/${draft.id}/reject`, {
                        method: 'POST',
                      });
                      if (res.ok) {
                        alert('Draft rejected');
                        const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drafts`);
                        const data2 = await res2.json();
                        setDrafts(data2);
                      }
                    } catch (error) {
                      console.error('Error:', error);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {filteredDrafts.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              {filter === 'ALL' ? 'No drafts generated yet.' : `No ${filter.toLowerCase()} drafts.`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

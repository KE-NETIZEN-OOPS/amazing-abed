'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getApiUrl } from '@/lib/api';

interface Account {
  id: string;
  username: string;
  type: string;
  status: string;
  lastActive: string | null;
}

interface Keyword {
  id: string;
  baseTerm: string;
  variants: string[];
}

interface ScrapingStatus {
  active: boolean;
  postsFound?: number;
  timeRemaining?: number;
  status?: 'scraping' | 'break';
}

export default function AccountDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;
  
  const [account, setAccount] = useState<Account | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [scrapingStatus, setScrapingStatus] = useState<ScrapingStatus>({ active: false });
  const [loading, setLoading] = useState(true);
  const [newKeyword, setNewKeyword] = useState('');
  const [showAddKeyword, setShowAddKeyword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountRes, keywordsRes, statusRes] = await Promise.all([
          fetch(getApiUrl('/accounts')).then(r => r.json()),
          fetch(getApiUrl(`/keywords/account/${accountId}`)).then(r => r.json()),
          fetch(getApiUrl(`/scraping/status/${accountId}`)).then(r => r.json()),
        ]);
        
        const foundAccount = accountRes.find((a: Account) => a.id === accountId);
        if (foundAccount) {
          setAccount(foundAccount);
        }
        setKeywords(keywordsRes || []);
        setScrapingStatus(statusRes || { active: false });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh status every 2 seconds for real-time updates
    const interval = setInterval(() => {
      fetch(getApiUrl(`/scraping/status/${accountId}`))
        .then(r => r.json())
        .then(data => setScrapingStatus(data || { active: false }))
        .catch(err => console.error('Status refresh error:', err));
    }, 2000);
    
    return () => clearInterval(interval);
  }, [accountId]);

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          baseTerm: newKeyword.trim(),
          variants: [newKeyword.trim()],
        }),
      });
      
      if (res.ok) {
        const keyword = await res.json();
        setKeywords([...keywords, keyword]);
        setNewKeyword('');
        setShowAddKeyword(false);
      }
    } catch (error) {
      console.error('Failed to add keyword:', error);
    }
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/keywords/${keywordId}`, {
        method: 'DELETE',
      });
      setKeywords(keywords.filter(k => k.id !== keywordId));
    } catch (error) {
      console.error('Failed to delete keyword:', error);
    }
  };

  const handleStartScraping = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scraping/start/${accountId}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh status
        const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scraping/status/${accountId}`);
        const statusData = await statusRes.json();
        setScrapingStatus(statusData || { active: false });
      }
    } catch (error) {
      console.error('Failed to start scraping:', error);
    }
  };

  const handleStopScraping = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scraping/stop/${accountId}`, {
        method: 'DELETE',
      });
      setScrapingStatus({ active: false });
    } catch (error) {
      console.error('Failed to stop scraping:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!account) {
    return (
      <div className="p-8">
        <p>Account not found</p>
        <Link href="/accounts" className="text-cyan-400">Back to Accounts</Link>
      </div>
    );
  }

  const timeRemaining = scrapingStatus.timeRemaining || 0;
  const minutesRemaining = Math.floor(timeRemaining / 60000);
  const secondsRemaining = Math.floor((timeRemaining % 60000) / 1000);
  const isBreak = scrapingStatus.status === 'break';
  const progressPercent = isBreak 
    ? 100 
    : Math.max(0, Math.min(100, ((30 * 60 * 1000 - timeRemaining) / (30 * 60 * 1000)) * 100));

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/accounts" className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block">
            ← Back to Accounts
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold neon-cyan">{account.username.trim()}</h1>
            <div className="flex gap-4 mt-2 text-sm text-gray-400">
              <span>Type: {account.type}</span>
              <span>Status: {account.status}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {scrapingStatus.active ? (
              <button
                onClick={handleStopScraping}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
              >
                Stop Scraping
              </button>
            ) : (
              <button
                onClick={handleStartScraping}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
              >
                Start Scraping
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {scrapingStatus.active && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Scraping Activity</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Status: <span className={isBreak ? 'text-yellow-400' : 'text-green-400'}>
                  {isBreak ? 'On Break' : 'Scraping'}
                </span></span>
                <span>Posts Found: <span className="text-cyan-400">{scrapingStatus.postsFound || 0}</span></span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${isBreak ? 'bg-yellow-500' : 'bg-cyan-500'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>
                  {isBreak ? (
                    <span>Break time remaining: {minutesRemaining}m {secondsRemaining}s</span>
                  ) : (
                    <span>Time remaining: {minutesRemaining}m {secondsRemaining}s</span>
                  )}
                </span>
                <span>{progressPercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Keywords Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Keywords</h2>
            <button
              onClick={() => setShowAddKeyword(!showAddKeyword)}
              className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg"
            >
              {showAddKeyword ? 'Cancel' : 'Add Keyword'}
            </button>
          </div>

          {showAddKeyword && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Enter keyword..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
              />
              <button
                onClick={handleAddKeyword}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
              >
                Add
              </button>
            </div>
          )}

          <div className="space-y-2">
            {keywords.length === 0 ? (
              <p className="text-gray-400">No keywords configured. Add keywords to filter scraped content.</p>
            ) : (
              keywords.map((keyword) => (
                <div
                  key={keyword.id}
                  className="flex justify-between items-center bg-gray-800 rounded-lg p-3"
                >
                  <div>
                    <span className="font-semibold">{keyword.baseTerm}</span>
                    {keyword.variants.length > 0 && (
                      <span className="text-sm text-gray-400 ml-2">
                        ({keyword.variants.join(', ')})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteKeyword(keyword.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

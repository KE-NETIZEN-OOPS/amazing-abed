'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function AccountDetailPage() {
  const params = useParams();
  const accountId = params.id as string;
  const [status, setStatus] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scraping/status/${accountId}`);
        const data = await res.json();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [accountId]);

  useEffect(() => {
    if (!status?.active) return;

    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/scraping/progress/${accountId}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data);
    };

    return () => eventSource.close();
  }, [accountId, status]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold neon-cyan mb-8">Account Status</h1>

        {status && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-4 h-4 rounded-full ${status.active ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className="text-xl font-bold">
                {status.active ? 'Scraping Active' : 'Not Scraping'}
              </span>
            </div>

            {status.active && progress && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Posts Found</span>
                    <span className="text-cyan-400 font-bold">{progress.postsFound}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Time Remaining</span>
                    <span className="text-yellow-400 font-bold">
                      {formatTime(progress.timeRemaining)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-cyan-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(progress.timeRemaining / (5 * 60 * 1000)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

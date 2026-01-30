'use client';

import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/api';

export default function DiagnosticsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(getApiUrl('/dashboard/stats'));
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    // Refresh every 5 seconds for live updates
    const interval = setInterval(() => {
      fetchStats().catch(err => console.error('Stats refresh error:', err));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold neon-cyan mb-8">Diagnostics</h1>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">System Health</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Accounts</span>
                  <span className="text-cyan-400">{stats.accounts}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Scrapes</span>
                  <span className="text-green-400">{stats.activeScrapes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Posts Found</span>
                  <span className="text-yellow-400">{stats.postsFound}</span>
                </div>
                <div className="flex justify-between">
                  <span>Drafts Generated</span>
                  <span className="text-purple-400">{stats.draftsGenerated}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

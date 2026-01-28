'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [stats, setStats] = useState({
    accounts: 0,
    activeScrapes: 0,
    postsFound: 0,
    draftsGenerated: 0,
  });

  useEffect(() => {
    // Refresh every 20 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    }, 20000);

    // Initial fetch
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`)
      .then(res => res.json())
      .then(setStats)
      .catch(console.error);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-2 neon-cyan">
          Amazing Abed
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Reddit Lead Intelligence Platform
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-3xl font-bold neon-cyan">{stats.accounts}</div>
            <div className="text-gray-400">Accounts</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-3xl font-bold neon-pink">{stats.activeScrapes}</div>
            <div className="text-gray-400">Active Scrapes</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-400">{stats.postsFound}</div>
            <div className="text-gray-400">Posts Found</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-yellow-400">{stats.draftsGenerated}</div>
            <div className="text-gray-400">Drafts Generated</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/accounts" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-cyan-500 transition-colors">
            <h2 className="text-2xl font-bold mb-2">Accounts</h2>
            <p className="text-gray-400">Manage Reddit accounts</p>
          </Link>
          <Link href="/feed" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-cyan-500 transition-colors">
            <h2 className="text-2xl font-bold mb-2">Live Feed</h2>
            <p className="text-gray-400">View scraped content in real-time</p>
          </Link>
          <Link href="/drafts" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-cyan-500 transition-colors">
            <h2 className="text-2xl font-bold mb-2">Drafts</h2>
            <p className="text-gray-400">Review and post draft replies</p>
          </Link>
          <Link href="/diagnostics" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-cyan-500 transition-colors">
            <h2 className="text-2xl font-bold mb-2">Diagnostics</h2>
            <p className="text-gray-400">System health and errors</p>
          </Link>
        </div>
      </div>
    </main>
  );
}

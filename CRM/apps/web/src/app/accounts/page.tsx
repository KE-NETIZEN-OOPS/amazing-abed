'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Account {
  id: string;
  username: string;
  type: string;
  status: string;
  lastActive: string | null;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`);
        const data = await res.json();
        setAccounts(data);
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
    const interval = setInterval(fetchAccounts, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleStartScraping = async (accountId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scraping/start/${accountId}`, {
        method: 'POST',
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        alert('✅ Scraping started successfully!');
      } else {
        alert(`❌ Failed to start scraping: ${data.error || 'Unknown error'}`);
      }
      
      // Refresh accounts
      const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`);
      const data2 = await res2.json();
      setAccounts(data2);
    } catch (error: any) {
      console.error('Failed to start scraping:', error);
      alert(`❌ Failed to start scraping: ${error.message || 'Network error'}`);
    }
  };

  const handleStopScraping = async (accountId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scraping/stop/${accountId}`, {
        method: 'DELETE',
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`);
      const data = await res.json();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to stop scraping:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold neon-cyan">Accounts</h1>
          <Link href="/accounts/new" className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg font-medium">
            Add Account
          </Link>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xl mb-4">No accounts found</p>
            <p className="mb-6">Add your first Reddit account to get started</p>
            <Link href="/accounts/new" className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg font-medium inline-block">
              Add Account
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {accounts.map((account) => (
              <div key={account.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-cyan-500 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <Link href={`/accounts/${account.id}`} className="block">
                      <h2 className="text-2xl font-bold hover:text-cyan-400 transition-colors">{account.username.trim()}</h2>
                    </Link>
                    <div className="flex gap-4 mt-2 text-sm text-gray-400">
                      <span>Type: {account.type}</span>
                      <span>Status: {account.status}</span>
                      {account.lastActive && (
                        <span>Last Active: {new Date(account.lastActive).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/accounts/${account.id}`}
                      className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleStartScraping(account.id)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
                    >
                      Start Scraping
                    </button>
                    <button
                      onClick={() => handleStopScraping(account.id)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                    >
                      Stop
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

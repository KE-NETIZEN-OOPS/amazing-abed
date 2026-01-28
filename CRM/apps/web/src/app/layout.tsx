import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Amazing Abed - Reddit Lead Intelligence',
  description: 'Reddit scraping and lead generation platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <nav className="border-b border-gray-800 bg-gray-900">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold neon-cyan">
                Amazing Abed
              </Link>
              <div className="flex gap-4">
                <Link href="/accounts" className="text-gray-400 hover:text-cyan-400">Accounts</Link>
                <Link href="/feed" className="text-gray-400 hover:text-cyan-400">Feed</Link>
                <Link href="/drafts" className="text-gray-400 hover:text-cyan-400">Drafts</Link>
                <Link href="/diagnostics" className="text-gray-400 hover:text-cyan-400">Diagnostics</Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}

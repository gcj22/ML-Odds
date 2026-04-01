import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'MLOdds - NHL Betting Intelligence',
  description: 'Live NHL scores, odds comparison, and AI-powered predictions for sharp bettors',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-white min-h-screen font-sans antialiased">
        <nav className="border-b border-yellow-500/20 bg-black/90 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-yellow-400 shrink-0">
              ML<span className="text-white">Odds</span>
            </Link>
            <div className="flex gap-1 text-sm overflow-x-auto">
              <Link href="/" className="px-3 py-1.5 text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 rounded transition-colors whitespace-nowrap">
                Today
              </Link>
              <Link href="/scores" className="px-3 py-1.5 text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 rounded transition-colors whitespace-nowrap">
                Scores
              </Link>
              <Link href="/schedule" className="px-3 py-1.5 text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 rounded transition-colors whitespace-nowrap">
                Schedule
              </Link>
              <Link href="/standings" className="px-3 py-1.5 text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 rounded transition-colors whitespace-nowrap">
                Standings
              </Link>
              <Link href="/stats/players" className="px-3 py-1.5 text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 rounded transition-colors whitespace-nowrap">
                Players
              </Link>
              <Link href="/odds" className="px-3 py-1.5 text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 rounded transition-colors whitespace-nowrap">
                Odds
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

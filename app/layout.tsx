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
            <Link href="/" className="text-xl font-bold text-yellow-400">
              ML<span className="text-white">Odds</span>
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/" className="text-gray-300 hover:text-yellow-400 transition-colors">
                Today
              </Link>
              <Link href="/scores" className="text-gray-300 hover:text-yellow-400 transition-colors">
                Scores
              </Link>
              <Link href="/odds" className="text-gray-300 hover:text-yellow-400 transition-colors">
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

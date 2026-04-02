import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'MLOdds — NHL Betting Intelligence',
  description: 'Live NHL scores, odds comparison, and AI-powered predictions for sharp bettors',
};

const NAV_LINKS = [
  { href: '/',          label: 'Today' },
  { href: '/scores',    label: 'Scores' },
  { href: '/schedule',  label: 'Schedule' },
  { href: '/standings', label: 'Standings' },
  { href: '/stats/players', label: 'Players' },
  { href: '/odds',      label: 'Odds' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        {/* ── Navigation ─────────────────────────────────────── */}
        <header className="luxury-nav">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center h-14 gap-8">
              {/* Wordmark */}
              <Link href="/" className="shrink-0 flex items-baseline gap-px" aria-label="MLOdds home">
                <span className="luxury-wordmark-accent">ML</span>
                <span className="luxury-wordmark-base">Odds</span>
              </Link>

              {/* Separator */}
              <div className="hidden sm:block luxury-nav-sep" />

              {/* Nav links */}
              <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide flex-1">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link key={href} href={href} className="luxury-nav-link">
                    {label}
                  </Link>
                ))}
              </nav>

              {/* Right-side season indicator */}
              <div className="shrink-0 hidden md:flex items-center gap-2">
                <div className="luxury-dot" />
                <span className="luxury-season-label">NHL 2024–25</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ───────────────────────────────────── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer className="luxury-footer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="luxury-footer-text">
              © {new Date().getFullYear()} MLOdds. For entertainment purposes only. Please gamble responsibly.
            </p>
            <p className="luxury-footer-text">Data via NHL API &amp; The Odds API</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

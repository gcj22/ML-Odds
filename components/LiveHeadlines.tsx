'use client';

import { useEffect, useRef, useState } from 'react';
import { ESPNNewsItem } from '@/app/api/espn/nhl/news/route';

interface NewsResponse {
  articles?: ESPNNewsItem[];
  error?: string;
}

function timeAgo(published: string): string {
  try {
    const diffMs = Date.now() - new Date(published).getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const hrs = Math.floor(diffMins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return '';
  }
}

export default function LiveHeadlines() {
  const [articles, setArticles] = useState<ESPNNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/espn/nhl/news');
      const data: NewsResponse = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setArticles(data.articles ?? []);
        setError(null);
      }
    } catch {
      setError('Failed to load headlines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    timerRef.current = setInterval(fetchNews, 60_000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div
      className="rounded overflow-hidden"
      style={{ background: '#121212', border: '1px solid #242424' }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.625rem 0.875rem',
          borderBottom: '1px solid #1C1C1C',
        }}
      >
        <p
          style={{
            fontSize: '0.5625rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#8A6B2C',
          }}
        >
          NHL News
        </p>
        <span
          style={{
            fontSize: '0.5625rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#4A9B6F',
          }}
        >
          LIVE
        </span>
      </div>

      {loading && (
        <div style={{ padding: '1rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: '1rem', borderRadius: '0.25rem', opacity: 0.6 }}
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <p style={{ padding: '0.875rem', fontSize: '0.8125rem', color: '#C04040' }}>
          {error}
        </p>
      )}

      {!loading && !error && articles.length === 0 && (
        <p style={{ padding: '0.875rem', fontSize: '0.8125rem', color: '#524D47' }}>
          No headlines available.
        </p>
      )}

      {!loading && !error && articles.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {articles.map((article, i) => {
            const href = article.links?.web?.href;
            const Inner = (
              <div style={{ padding: '0.625rem 0.875rem', borderBottom: i < articles.length - 1 ? '1px solid #1C1C1C' : 'none' }}>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: '#EDE8E0',
                    lineHeight: 1.4,
                    letterSpacing: '-0.005em',
                  }}
                >
                  {article.headline}
                </p>
                {article.published && (
                  <p style={{ fontSize: '0.625rem', color: '#524D47', marginTop: '0.25rem' }}>
                    {timeAgo(article.published)}
                  </p>
                )}
              </div>
            );
            return (
              <li key={i} className="luxury-row">
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                  >
                    {Inner}
                  </a>
                ) : (
                  Inner
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

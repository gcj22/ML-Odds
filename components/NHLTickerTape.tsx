'use client';

import { useEffect, useRef, useState } from 'react';
import { NHLGame } from '@/lib/types';

interface ScoresResponse {
  games: NHLGame[];
}

function formatStartTime(utcTime: string): string {
  try {
    return new Date(utcTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: 'America/New_York',
    });
  } catch {
    return utcTime;
  }
}

function isLive(state: NHLGame['gameState']): boolean {
  return state === 'LIVE' || state === 'CRIT';
}

function isFinal(state: NHLGame['gameState']): boolean {
  return state === 'FINAL' || state === 'OFF' || state === 'OVER';
}

function GameChip({ game }: { game: NHLGame }) {
  const away = game.awayTeam.abbrev;
  const home = game.homeTeam.abbrev;
  const live = isLive(game.gameState);
  const final = isFinal(game.gameState);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.25rem 0.875rem',
        borderRadius: '0.25rem',
        background: live ? 'rgba(192,64,64,0.08)' : 'rgba(198,151,63,0.05)',
        border: live
          ? '1px solid rgba(192,64,64,0.22)'
          : '1px solid rgba(198,151,63,0.14)',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: '#EDE8E0',
        }}
      >
        {away} @ {home}
      </span>

      {(live || final) && (
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: live ? '#C04040' : '#524D47',
            letterSpacing: '0.02em',
          }}
        >
          {game.awayTeam.score ?? 0}–{game.homeTeam.score ?? 0}
        </span>
      )}

      {live && (
        <span
          style={{
            fontSize: '0.5625rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#C04040',
            background: 'rgba(192,64,64,0.12)',
            border: '1px solid rgba(192,64,64,0.25)',
            borderRadius: '0.1875rem',
            padding: '0.125rem 0.375rem',
          }}
        >
          LIVE
        </span>
      )}

      {final && (
        <span className="badge-final">FINAL</span>
      )}

      {!live && !final && (
        <span
          style={{
            fontSize: '0.6875rem',
            color: '#8A6B2C',
            letterSpacing: '0.02em',
          }}
        >
          {formatStartTime(game.startTimeUTC)}
        </span>
      )}
    </span>
  );
}

export default function NHLTickerTape() {
  const [games, setGames] = useState<NHLGame[]>([]);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchGames = async () => {
    try {
      const res = await fetch('/api/scores');
      if (res.ok) {
        const data: ScoresResponse = await res.json();
        setGames(data.games ?? []);
      }
    } catch {
      // silently ignore ticker errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    timerRef.current = setInterval(fetchGames, 60_000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: '2.25rem',
          background: '#121212',
          border: '1px solid #1C1C1C',
          borderRadius: '0.25rem',
        }}
        className="skeleton"
      />
    );
  }

  if (games.length === 0) {
    return (
      <div
        style={{
          padding: '0.5rem 1rem',
          background: '#121212',
          border: '1px solid #1C1C1C',
          borderRadius: '0.25rem',
          fontSize: '0.8125rem',
          color: '#524D47',
          letterSpacing: '0.02em',
        }}
      >
        No NHL games scheduled today.
      </div>
    );
  }

  return (
    <div
      style={{
        overflow: 'hidden',
        background: '#0E0E0E',
        border: '1px solid #1C1C1C',
        borderRadius: '0.25rem',
        padding: '0.375rem 0',
        position: 'relative',
      }}
    >
      {/* Label */}
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          padding: '0 0.75rem',
          fontSize: '0.5625rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#8A6B2C',
          background: 'linear-gradient(90deg, #0E0E0E 70%, transparent)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        Tonight
      </span>
      <div
        className="scrollbar-hide"
        style={{
          display: 'flex',
          gap: '0.625rem',
          overflowX: 'auto',
          padding: '0 1rem 0 5rem',
        }}
      >
        {games.map((g) => (
          <GameChip key={g.id} game={g} />
        ))}
      </div>
    </div>
  );
}

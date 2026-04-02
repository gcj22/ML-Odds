'use client';

import { NHLGame } from '@/lib/types';
import { getGameStatus, formatGameTime } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function ScoreboardStrip({ games }: { games: NHLGame[] }) {
  if (games.length === 0) {
    return (
      <div
        className="rounded px-4 py-3 text-sm text-center"
        style={{
          background: '#121212',
          border: '1px dashed #1C1C1C',
          color: '#524D47',
        }}
      >
        No games scheduled today
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 pb-1" style={{ minWidth: 'max-content' }}>
        {games.map((game) => {
          const status = getGameStatus(game);
          const isLive = ['LIVE', 'CRIT'].includes(game.gameState);
          const isFinal = ['FINAL', 'OFF', 'OVER'].includes(game.gameState);

          return (
            <Link key={game.id} href={`/game/${game.id}`}>
              <div
                className="card-interactive rounded"
                style={{
                  padding: '0.75rem 1rem',
                  minWidth: '160px',
                  transition: 'border-color 200ms, background 200ms, box-shadow 200ms',
                }}
              >
                {/* Status */}
                <div className="flex items-center justify-between mb-2.5">
                  {isLive ? (
                    <span className="flex items-center gap-1" style={{ fontSize: '0.625rem',
                      fontWeight: 700, letterSpacing: '0.1em', color: '#C04040',
                      textTransform: 'uppercase' }}>
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
                        style={{ background: '#C04040', display: 'inline-block' }}
                      />
                      Live
                    </span>
                  ) : isFinal ? (
                    <span style={{ fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em',
                      color: '#524D47', textTransform: 'uppercase' }}>
                      Final
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em',
                      color: '#8A6B2C', textTransform: 'uppercase' }}>
                      {status}
                    </span>
                  )}
                  {!isLive && !isFinal && (
                    <span style={{ fontSize: '0.6875rem', color: '#524D47' }}>
                      {formatGameTime(game.startTimeUTC)}
                    </span>
                  )}
                </div>

                {/* Teams */}
                <div className="space-y-1.5">
                  {[game.awayTeam, game.homeTeam].map((team, i) => (
                    <div key={team.abbrev} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {team.logo ? (
                          <Image
                            src={team.logo}
                            alt={team.abbrev}
                            width={18}
                            height={18}
                            className="object-contain opacity-90"
                            unoptimized
                          />
                        ) : (
                          <div
                            className="w-4 h-4 rounded-sm flex items-center justify-center"
                            style={{ background: '#1C1C1C', fontSize: '0.5rem', color: '#524D47' }}
                          >
                            {team.abbrev.slice(0, 1)}
                          </div>
                        )}
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#EDE8E0',
                          letterSpacing: '-0.01em' }}>
                          {team.abbrev}
                        </span>
                        {i === 1 && (
                          <span style={{ fontSize: '0.5625rem', color: '#524D47', letterSpacing: '0.04em' }}>
                            HM
                          </span>
                        )}
                      </div>
                      {(isLive || isFinal) && team.score !== undefined && (
                        <span
                          className="font-bold tabular-nums"
                          style={{ fontSize: '1rem', color: '#EDE8E0', letterSpacing: '-0.03em' }}
                        >
                          {team.score}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

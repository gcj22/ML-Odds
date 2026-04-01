'use client';

import { NHLGame } from '@/lib/types';
import { getGameStatus, formatGameTime } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function ScoreboardStrip({ games }: { games: NHLGame[] }) {
  if (games.length === 0) {
    return (
      <div className="w-full bg-card border border-border rounded-lg px-4 py-3 text-gray-500 text-sm text-center">
        No games scheduled today
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 pb-2" style={{ minWidth: 'max-content' }}>
        {games.map((game) => {
          const status = getGameStatus(game);
          const isLive = ['LIVE', 'CRIT'].includes(game.gameState);
          const isFinal = ['FINAL', 'OFF', 'OVER'].includes(game.gameState);

          return (
            <Link key={game.id} href={`/game/${game.id}`}>
              <div className="bg-card border border-border rounded-lg px-4 py-3 hover:border-yellow-500/40 transition-all cursor-pointer min-w-[180px]">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-semibold ${
                      isLive ? 'text-red-400' : isFinal ? 'text-gray-500' : 'text-yellow-400'
                    }`}
                  >
                    {isLive ? '● ' : ''}{status}
                  </span>
                  {!isLive && !isFinal && (
                    <span className="text-xs text-gray-600">
                      {formatGameTime(game.startTimeUTC)}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {[game.awayTeam, game.homeTeam].map((team, i) => (
                    <div key={team.abbrev} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        {team.logo && (
                          <Image
                            src={team.logo}
                            alt={team.abbrev}
                            width={20}
                            height={20}
                            className="object-contain"
                            unoptimized
                          />
                        )}
                        <span className="text-sm font-semibold">{team.abbrev}</span>
                        {i === 1 && <span className="text-xs text-gray-600">H</span>}
                      </div>
                      {(isLive || isFinal) && team.score !== undefined && (
                        <span className="font-bold">{team.score}</span>
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

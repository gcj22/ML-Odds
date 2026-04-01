import Link from 'next/link';
import Image from 'next/image';
import { NHLGame, BestLines, GamePrediction } from '@/lib/types';
import { formatGameTime, getGameStatus, formatAmericanOdds } from '@/lib/utils';

interface GameCardProps {
  game: NHLGame;
  bestLines?: BestLines;
  prediction?: GamePrediction;
}

export default function GameCard({ game, bestLines, prediction }: GameCardProps) {
  const status = getGameStatus(game);
  const isLive = ['LIVE', 'CRIT'].includes(game.gameState);
  const isFinal = ['FINAL', 'OFF', 'OVER'].includes(game.gameState);

  return (
    <Link href={`/game/${game.id}`}>
      <div className="bg-card border border-border rounded-lg p-4 hover:border-yellow-500/40 transition-all cursor-pointer">
        {/* Status */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              isLive
                ? 'bg-red-500/20 text-red-400'
                : isFinal
                ? 'bg-gray-700 text-gray-400'
                : 'bg-yellow-500/10 text-yellow-400'
            }`}
          >
            {isLive ? '● LIVE' : status}
          </span>
          {!isFinal && !isLive && (
            <span className="text-xs text-gray-500">{formatGameTime(game.startTimeUTC)}</span>
          )}
        </div>

        {/* Teams */}
        <div className="space-y-2">
          {[
            { team: game.awayTeam, label: 'Away' },
            { team: game.homeTeam, label: 'Home' },
          ].map(({ team, label }) => (
            <div key={team.abbrev} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {team.logo && (
                  <Image
                    src={team.logo}
                    alt={team.abbrev}
                    width={24}
                    height={24}
                    className="object-contain"
                    unoptimized
                  />
                )}
                <span className="font-semibold text-sm">
                  {team.placeName?.default ?? team.abbrev}
                </span>
                <span className="text-xs text-gray-500">{label}</span>
              </div>
              {(isLive || isFinal) && team.score !== undefined && (
                <span className="text-xl font-bold">{team.score}</span>
              )}
            </div>
          ))}
        </div>

        {/* Odds */}
        {bestLines && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="grid grid-cols-3 gap-2 text-xs">
              {bestLines.h2h && (
                <>
                  <div className="text-center">
                    <div className="text-gray-500 mb-1">ML Away</div>
                    <div className="font-mono text-yellow-400">
                      {formatAmericanOdds(bestLines.h2h.away.price)}
                    </div>
                    <div className="text-gray-600">{bestLines.h2h.away.bookTitle}</div>
                  </div>
                  <div className="text-center">
                    {bestLines.totals && (
                      <>
                        <div className="text-gray-500 mb-1">
                          O/U {bestLines.totals.over.point}
                        </div>
                        <div className="font-mono text-yellow-400">
                          {formatAmericanOdds(bestLines.totals.over.price)}
                        </div>
                        <div className="text-gray-600">{bestLines.totals.over.bookTitle}</div>
                      </>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500 mb-1">ML Home</div>
                    <div className="font-mono text-yellow-400">
                      {formatAmericanOdds(bestLines.h2h.home.price)}
                    </div>
                    <div className="text-gray-600">{bestLines.h2h.home.bookTitle}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Prediction lean */}
        {prediction && (prediction.puck_line_lean || prediction.total_lean) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {prediction.puck_line_lean && (
              <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded">
                Puck Line:{' '}
                {prediction.puck_line_lean.side === 'home'
                  ? game.homeTeam.abbrev
                  : game.awayTeam.abbrev}{' '}
                ({prediction.puck_line_lean.edge.toFixed(2)} edge)
              </span>
            )}
            {prediction.total_lean && (
              <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">
                {prediction.total_lean.side.toUpperCase()} (
                {prediction.total_lean.edge.toFixed(2)} edge)
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

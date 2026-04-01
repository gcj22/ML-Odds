import { NHLBoxscore, BestLines, GamePrediction } from '@/lib/types';
import { getGameStatus, formatGameTime } from '@/lib/utils';
import Image from 'next/image';
import BoxScore from './BoxScore';
import OddsPanel from './OddsPanel';
import PredictionsPanel from './PredictionsPanel';

interface GameCenterProps {
  boxscore: NHLBoxscore;
  bestLines?: BestLines;
  prediction?: GamePrediction;
}

export default function GameCenter({ boxscore, bestLines, prediction }: GameCenterProps) {
  const { awayTeam, homeTeam } = boxscore;
  const status = getGameStatus(boxscore);
  const isLive = ['LIVE', 'CRIT'].includes(boxscore.gameState);
  const isFinal = ['FINAL', 'OFF', 'OVER'].includes(boxscore.gameState);

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-center gap-8">
          {/* Away Team */}
          <div className="flex flex-col items-center gap-2">
            {awayTeam.logo && (
              <Image
                src={awayTeam.logo}
                alt={awayTeam.abbrev}
                width={64}
                height={64}
                className="object-contain"
                unoptimized
              />
            )}
            <div className="text-center">
              <div className="font-bold text-lg">{awayTeam.placeName?.default ?? awayTeam.abbrev}</div>
              <div className="text-sm text-gray-400">Away</div>
            </div>
            {(isLive || isFinal) && (
              <div className="text-4xl font-bold text-yellow-400">{awayTeam.score ?? 0}</div>
            )}
          </div>

          {/* Status */}
          <div className="text-center">
            <div
              className={`text-sm font-semibold px-3 py-1 rounded mb-2 ${
                isLive
                  ? 'bg-red-500/20 text-red-400'
                  : isFinal
                  ? 'bg-gray-700 text-gray-400'
                  : 'bg-yellow-500/10 text-yellow-400'
              }`}
            >
              {isLive ? '● LIVE' : status}
            </div>
            {!isFinal && !isLive && boxscore.gameDate && (
              <div className="text-sm text-gray-500">
                {formatGameTime(boxscore.gameDate + 'T00:00:00Z')}
              </div>
            )}
            {isLive && boxscore.clock && (
              <div className="text-sm text-gray-300">
                P{boxscore.period} · {boxscore.clock.timeRemaining}
              </div>
            )}
            <div className="text-gray-600 text-xs mt-1">vs</div>
          </div>

          {/* Home Team */}
          <div className="flex flex-col items-center gap-2">
            {homeTeam.logo && (
              <Image
                src={homeTeam.logo}
                alt={homeTeam.abbrev}
                width={64}
                height={64}
                className="object-contain"
                unoptimized
              />
            )}
            <div className="text-center">
              <div className="font-bold text-lg">{homeTeam.placeName?.default ?? homeTeam.abbrev}</div>
              <div className="text-sm text-gray-400">Home</div>
            </div>
            {(isLive || isFinal) && (
              <div className="text-4xl font-bold text-yellow-400">{homeTeam.score ?? 0}</div>
            )}
          </div>
        </div>
      </div>

      {/* Odds + Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OddsPanel bestLines={bestLines} />
        <PredictionsPanel
          prediction={prediction}
          homeAbbrev={homeTeam.abbrev}
          awayAbbrev={awayTeam.abbrev}
        />
      </div>

      {/* Box Score */}
      <BoxScore boxscore={boxscore} />
    </div>
  );
}
